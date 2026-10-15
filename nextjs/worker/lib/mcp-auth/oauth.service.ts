import { prefixOf, TOKEN_PREFIX } from "./api-token.service";
import { hashToken, randomToken } from "./crypto";
import { clientNameOf, isMetadataClientId, narrowScope, parseRedirectUris, parseScope } from "./oauth-params";
import type { OauthClient, OauthClientRepository, OauthCodeRepository, OauthRefreshTokenRepository } from "./oauth.types";
import { isCodeChallenge, verifyPkce } from "./pkce";
import { API_SCOPES, type ApiToken, type ApiTokenRepository } from "./types";

/**
 * OAuth 2.1 の認可サーバー（このサイト自身）。MCP のアクセストークンを、管理者の同意を通して AI ツールに渡す。
 *
 * - クライアントは動的登録（RFC 7591）か、client_id が https の URL ならその文書（Client ID Metadata Document）で知る
 * - 認可コード + PKCE（S256）だけ。クライアント認証は無し（公開クライアント）
 * - アクセストークンは api_tokens（kind: oauth、1 時間）。リフレッシュトークンは回転し、再利用を検知したら family ごと失効
 * KU-PULS の実装を移植したもの。
 */

const CODE_TTL_MS = 10 * 60 * 1000;
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** client_id の URL から取った文書を使い回す時間 */
const CLIENT_METADATA_TTL_MS = 24 * 60 * 60 * 1000;
/** 動的登録は誰でも呼べるので上限を置き、1 時間使われていないクライアントは片付ける */
const MAX_REGISTERED_CLIENTS = 200;
const MAX_METADATA_CLIENTS = 100;
const UNUSED_CLIENT_TTL_MS = 60 * 60 * 1000;
/** 認可を始めたときに「使われている」印（fetched_at）を書き直す間隔 */
const CLIENT_ACTIVITY_TOUCH_MS = 5 * 60 * 1000;
const METADATA_FETCH_TIMEOUT_MS = 5000;
const METADATA_MAX_BYTES = 64 * 1024;
const MAX_STATE_LENGTH = 512;
const CLIENT_ID_PREFIX = "ptfc_";

interface OauthServiceDeps {
  readonly clients: OauthClientRepository;
  readonly codes: OauthCodeRepository;
  readonly refreshTokens: OauthRefreshTokenRepository;
  readonly tokens: ApiTokenRepository;
  readonly now?: () => Date;
  /** client_id の文書を取る（テストで差し替える） */
  readonly fetch?: typeof fetch;
}

/** 検査の済んだ認可の要求（同意画面に出し、コードを作る元） */
interface AuthorizationRequest {
  readonly clientId: string;
  readonly clientName: string;
  readonly redirectUri: string;
  readonly scope: string;
  readonly state: string | null;
  readonly codeChallenge: string;
  readonly resource: string | null;
}

type PrepareResult =
  | { readonly status: "ok"; readonly request: AuthorizationRequest }
  /** クライアントや redirect_uri が不正。利用者を戻せないので画面でエラーにする */
  | { readonly status: "invalid_client"; readonly message: string }
  /** それ以外の不正。redirect_uri へ error を付けて戻す */
  | { readonly status: "redirect_error"; readonly redirectUri: string; readonly error: string; readonly description: string; readonly state: string | null };

export interface OauthError {
  readonly error: string;
  readonly error_description: string;
}

interface TokenResponse {
  readonly access_token: string;
  readonly token_type: "Bearer";
  readonly expires_in: number;
  readonly refresh_token: string;
  readonly scope: string;
}

type TokenResult = { readonly status: "ok"; readonly tokens: TokenResponse } | { readonly status: "error"; readonly body: OauthError };

type Form = Record<string, string | undefined>;

export function createOauthService(deps: OauthServiceDeps) {
  const now = deps.now ?? (() => new Date());
  const fetcher = deps.fetch ?? fetch;
  const mcpResource = (origin: string) => `${origin}/api/mcp`;
  const invalidGrant = (description: string): TokenResult => ({ status: "error", body: { error: "invalid_grant", error_description: description } });

  /** client_id が https の URL なら、その文書を取って（または 24 時間の写しを）クライアントにする */
  async function resolveClient(clientId: string): Promise<OauthClient | null> {
    const cached = await deps.clients.find(clientId);

    if (cached !== null && (cached.source === "registered" || Date.parse(cached.fetchedAt) + CLIENT_METADATA_TTL_MS > now().getTime())) {
      return cached;
    }

    if (!isMetadataClientId(clientId)) {
      return null;
    }

    // 写しが古く、取り直せなければ使わない（消された redirect_uri をいつまでも信じないため）
    const fetched = await fetchClientMetadata(clientId);

    if (fetched === null) {
      return null;
    }

    if (cached === null) {
      await purgeUnusedClients("metadata");
      return (await deps.clients.saveIfBelow(fetched, MAX_METADATA_CLIENTS)) ? fetched : null;
    }

    await deps.clients.save(fetched);
    return fetched;
  }

  async function fetchClientMetadata(clientId: string): Promise<OauthClient | null> {
    try {
      const response = await fetcher(clientId, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(METADATA_FETCH_TIMEOUT_MS) });
      const text = response.status === 200 ? await response.text() : "";

      if (text === "" || text.length > METADATA_MAX_BYTES) {
        return null;
      }

      const document = JSON.parse(text) as Record<string, unknown>;
      const redirectUris = parseRedirectUris(document.redirect_uris);

      if (document.client_id !== clientId || redirectUris === null) {
        return null;
      }

      return { clientId, clientName: clientNameOf(document.client_name, new URL(clientId).hostname), redirectUris, source: "metadata", fetchedAt: now().toISOString() };
    } catch {
      return null;
    }
  }

  /**
   * アクセストークンとリフレッシュトークンの組を作る。リフレッシュトークン（family との結び付き）を先に入れ、
   * アクセストークンを入れたあとで両方が残っているかを確かめる。間に失効が入っていれば残った方も消して null を返す
   */
  async function issueTokens(userId: number, client: OauthClient, scope: string, audience: string | null, familyId: string): Promise<TokenResponse | null> {
    const at = now();
    const accessPlain = `${TOKEN_PREFIX}${randomToken()}`;
    const access: ApiToken = {
      id: await hashToken(accessPlain),
      userId,
      kind: "oauth",
      label: client.clientName,
      prefix: prefixOf(accessPlain),
      clientId: client.clientId,
      scope,
      audience,
      createdAt: at.toISOString(),
      lastUsedAt: null,
      expiresAt: new Date(at.getTime() + ACCESS_TOKEN_TTL_SECONDS * 1000).toISOString(),
    };
    const refreshPlain = `ptfr_${randomToken()}`;
    const refreshId = await hashToken(refreshPlain);

    await deps.refreshTokens.save({
      id: refreshId,
      userId,
      clientId: client.clientId,
      familyId,
      scope,
      audience,
      accessTokenId: access.id,
      expiresAt: new Date(at.getTime() + REFRESH_TOKEN_TTL_MS).toISOString(),
      usedAt: null,
    });
    await deps.tokens.save(access);

    if ((await deps.refreshTokens.find(refreshId)) === null || (await deps.tokens.find(access.id)) === null) {
      await deps.refreshTokens.delete(refreshId);
      await deps.tokens.delete(userId, access.id);
      return null;
    }

    return { access_token: accessPlain, token_type: "Bearer", expires_in: ACCESS_TOKEN_TTL_SECONDS, refresh_token: refreshPlain, scope };
  }

  async function exchangeCode(form: Form, origin: string): Promise<TokenResult> {
    // 検査が済むまでは消さない。横取りしたコードを偽の code_verifier で送られても、正しいクライアントの交換を潰させない
    const code = form.code ? await deps.codes.find(await hashToken(form.code)) : null;

    if (code === null || Date.parse(code.expiresAt) < now().getTime()) {
      return invalidGrant("認可コードが無いか、期限切れか、使用済みです。");
    }

    if (form.client_id !== code.clientId || (form.redirect_uri ?? code.redirectUri) !== code.redirectUri) {
      return invalidGrant("client_id または redirect_uri が認可の要求と一致しません。");
    }

    if (!(await verifyPkce(form.code_verifier, code.codeChallenge))) {
      return invalidGrant("code_verifier が code_challenge と一致しません。");
    }

    const resource = form.resource ?? null;

    if (resource !== null && (resource !== mcpResource(origin) || (code.audience !== null && resource !== code.audience))) {
      return { status: "error", body: { error: "invalid_target", error_description: `resource は ${mcpResource(origin)} だけに対応しています。` } };
    }

    const client = await resolveClient(code.clientId);

    if (client === null) {
      return invalidGrant("client_id が登録されていません。");
    }

    // 検査がすべて通った要求だけが、1 回限りの消費を行う（同時の交換は 1 つしか通らない）
    if ((await deps.codes.consume(code.id)) === null) {
      return invalidGrant("認可コードが無いか、期限切れか、使用済みです。");
    }

    // 認可のときに resource が無く、交換のときにあれば、そちらに結び付ける
    const issued = await issueTokens(code.userId, client, code.scope, code.audience ?? resource, crypto.randomUUID());
    return issued === null ? invalidGrant("認可が失効しました。もう一度認可してください。") : { status: "ok", tokens: issued };
  }

  async function refresh(form: Form): Promise<TokenResult> {
    const current = form.refresh_token ? await deps.refreshTokens.find(await hashToken(form.refresh_token)) : null;

    if (current === null || Date.parse(current.expiresAt) < now().getTime()) {
      return invalidGrant("リフレッシュトークンが無いか、期限切れです。");
    }

    if (form.client_id !== undefined && form.client_id !== current.clientId) {
      return invalidGrant("client_id がトークンのものと一致しません。");
    }

    const scope = form.scope === undefined ? current.scope : narrowScope(form.scope, current.scope);

    if (scope === null) {
      return { status: "error", body: { error: "invalid_scope", error_description: "scope は元の範囲より広げられません。" } };
    }

    const client = await resolveClient(current.clientId);

    if (client === null) {
      return invalidGrant("client_id が登録されていません。");
    }

    // 使用済みにできた要求だけが新しいトークンを得る。すでに使用済みなら、盗まれたとみなして family ごと失効する
    if (current.usedAt !== null || !(await deps.refreshTokens.markUsed(current.id, now().toISOString()))) {
      await revokeFamily(current.userId, current.familyId);
      return invalidGrant("リフレッシュトークンは使用済みです。このクライアントのトークンをすべて失効しました。");
    }

    await deps.tokens.delete(current.userId, current.accessTokenId);
    const issued = await issueTokens(current.userId, client, scope, current.audience, current.familyId);

    if (issued === null) {
      return invalidGrant("リフレッシュトークンは失効しました。もう一度認可してください。");
    }

    // 新しい組を保存している間に、同時の要求（盗用の検知）が family を失効させていたら、いま出した組も失効する
    if ((await deps.refreshTokens.find(current.id)) === null) {
      await revokeFamily(current.userId, current.familyId);
      await deps.tokens.delete(current.userId, await hashToken(issued.access_token));
      await deps.refreshTokens.delete(await hashToken(issued.refresh_token));
      return invalidGrant("リフレッシュトークンは使用済みです。このクライアントのトークンをすべて失効しました。");
    }

    return { status: "ok", tokens: issued };
  }

  /** 期限の切れたリフレッシュトークンと対になるアクセストークン、リフレッシュトークンの寿命も過ぎたアクセストークンを消す */
  async function purgeExpiredGrants(): Promise<void> {
    const at = now();
    await deps.refreshTokens.deleteExpired(at.toISOString());
    await deps.tokens.deleteExpired(new Date(at.getTime() - REFRESH_TOKEN_TTL_MS).toISOString());
  }

  async function purgeUnusedClients(source: OauthClient["source"]): Promise<void> {
    await purgeExpiredGrants();
    await deps.clients.deleteUnusedBefore(source, new Date(now().getTime() - UNUSED_CLIENT_TTL_MS).toISOString(), now().toISOString());
  }

  async function revokeFamily(userId: number, familyId: string): Promise<void> {
    for (const accessTokenId of await deps.refreshTokens.deleteFamily(familyId)) {
      await deps.tokens.delete(userId, accessTokenId);
    }
  }

  return {
    /** RFC 9728: この MCP エンドポイントを守る認可サーバーの案内 */
    resourceMetadata(origin: string): Record<string, unknown> {
      return {
        resource: mcpResource(origin),
        authorization_servers: [origin],
        scopes_supported: API_SCOPES,
        bearer_methods_supported: ["header"],
        resource_name: "Portfolio Admin",
      };
    },

    /** RFC 8414: 認可サーバーの案内 */
    serverMetadata(origin: string): Record<string, unknown> {
      return {
        issuer: origin,
        authorization_endpoint: `${origin}/api/oauth/authorize`,
        token_endpoint: `${origin}/api/oauth/token`,
        registration_endpoint: `${origin}/api/oauth/register`,
        revocation_endpoint: `${origin}/api/oauth/revoke`,
        scopes_supported: API_SCOPES,
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code", "refresh_token"],
        code_challenge_methods_supported: ["S256"],
        token_endpoint_auth_methods_supported: ["none"],
        revocation_endpoint_auth_methods_supported: ["none"],
        client_id_metadata_document_supported: true,
      };
    },

    /** RFC 7591: クライアントの動的登録。公開クライアントだけ（秘密は発行しない） */
    async register(input: unknown): Promise<{ status: "ok"; client: Record<string, unknown> } | { status: "error"; body: OauthError }> {
      const body = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
      const redirectUris = parseRedirectUris(body.redirect_uris);

      if (redirectUris === null) {
        return { status: "error", body: { error: "invalid_redirect_uri", error_description: "redirect_uris は https（または localhost）の URL を 1〜10 件指定してください。" } };
      }

      if (body.token_endpoint_auth_method !== undefined && body.token_endpoint_auth_method !== "none") {
        return { status: "error", body: { error: "invalid_client_metadata", error_description: "token_endpoint_auth_method は none だけに対応しています（公開クライアント）。" } };
      }

      await purgeUnusedClients("registered");
      const client: OauthClient = {
        clientId: `${CLIENT_ID_PREFIX}${randomToken()}`,
        clientName: clientNameOf(body.client_name, "AI ツール"),
        redirectUris,
        source: "registered",
        fetchedAt: now().toISOString(),
      };

      if (!(await deps.clients.saveIfBelow(client, MAX_REGISTERED_CLIENTS))) {
        return { status: "error", body: { error: "too_many_clients", error_description: "登録できるクライアントの上限に達しています。しばらくしてからやり直してください。" } };
      }

      return {
        status: "ok",
        client: {
          client_id: client.clientId,
          client_name: client.clientName,
          redirect_uris: client.redirectUris,
          token_endpoint_auth_method: "none",
          grant_types: ["authorization_code", "refresh_token"],
          response_types: ["code"],
        },
      };
    },

    /** 認可の要求（GET /api/oauth/authorize のクエリ、同意フォーム）を検査する */
    async prepareAuthorization(query: Form, origin: string): Promise<PrepareResult> {
      const client = query.client_id ? await resolveClient(query.client_id) : null;

      if (client === null) {
        return { status: "invalid_client", message: "client_id が登録されていません。" };
      }

      if (client.source === "registered" && Date.parse(client.fetchedAt) + CLIENT_ACTIVITY_TOUCH_MS < now().getTime()) {
        // 認可を始めたら「使われている」と記録し、同意の途中で片付けられないようにする
        await deps.clients.save({ ...client, fetchedAt: now().toISOString() });
      }

      const redirectUri = query.redirect_uri ?? (client.redirectUris.length === 1 ? (client.redirectUris[0] ?? "") : "");

      if (!client.redirectUris.includes(redirectUri)) {
        return { status: "invalid_client", message: "redirect_uri が登録されたものと一致しません。" };
      }

      const state = query.state ?? null;
      const fail = (error: string, description: string): PrepareResult => ({ status: "redirect_error", redirectUri, error, description, state });

      if (state !== null && state.length > MAX_STATE_LENGTH) {
        return fail("invalid_request", "state が長すぎます。");
      }

      if (query.response_type !== "code") {
        return fail("unsupported_response_type", "response_type は code だけに対応しています。");
      }

      if ((query.code_challenge_method ?? "S256") !== "S256" || !isCodeChallenge(query.code_challenge)) {
        return fail("invalid_request", "PKCE の code_challenge（S256）が必要です。");
      }

      const scope = parseScope(query.scope);

      if (scope === null) {
        return fail("invalid_scope", `scope は ${API_SCOPES.join(" / ")} から選んでください。`);
      }

      const resource = query.resource ?? null;

      if (resource !== null && resource !== mcpResource(origin)) {
        return fail("invalid_target", `resource は ${mcpResource(origin)} だけに対応しています。`);
      }

      return { status: "ok", request: { clientId: client.clientId, clientName: client.clientName, redirectUri, scope, state, codeChallenge: query.code_challenge, resource } };
    },

    /** 管理者が同意したので認可コードを作る。平文を返し、保存するのはハッシュ */
    async issueCode(userId: number, request: AuthorizationRequest): Promise<string> {
      await deps.codes.deleteExpired(now().toISOString());
      const plain = randomToken();
      await deps.codes.save({
        id: await hashToken(plain),
        clientId: request.clientId,
        userId,
        redirectUri: request.redirectUri,
        codeChallenge: request.codeChallenge,
        scope: request.scope,
        audience: request.resource,
        expiresAt: new Date(now().getTime() + CODE_TTL_MS).toISOString(),
      });
      return plain;
    },

    /** POST /api/oauth/token（authorization_code と refresh_token） */
    async exchange(form: Form, origin: string): Promise<TokenResult> {
      await purgeExpiredGrants();

      switch (form.grant_type) {
        case "authorization_code":
          return exchangeCode(form, origin);
        case "refresh_token":
          return refresh(form);
        default:
          return { status: "error", body: { error: "unsupported_grant_type", error_description: "grant_type は authorization_code か refresh_token です。" } };
      }
    },

    /** RFC 7009: アクセストークンでもリフレッシュトークンでも失効する。知らないトークンでも成功として返す */
    async revoke(token: string): Promise<void> {
      const id = await hashToken(token);
      const access = await deps.tokens.find(id);
      const paired = await deps.refreshTokens.findByAccessTokenId(id);
      const refreshToken = access === null && paired === null ? await deps.refreshTokens.find(id) : null;
      const family = paired ?? refreshToken;

      if (family !== null) {
        await revokeFamily(family.userId, family.familyId);
      }

      if (access !== null) {
        await deps.tokens.delete(access.userId, id);
      }
    },
  };
}
