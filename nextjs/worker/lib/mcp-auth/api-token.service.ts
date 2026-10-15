import { hashToken, randomToken } from "./crypto";
import { API_SCOPES, type ApiScope, type ApiToken, type ApiTokenRepository, type McpUser, type McpUserLookup } from "./types";

/**
 * AI ツール（Claude Code・dots・ChatGPT・Claude など）が MCP サーバーに接続するためのアクセストークン。
 *
 * 管理画面で発行する個人トークンは `ptf_` + 43 文字で、平文は発行したときに 1 回だけ返し、D1 には SHA-256 だけを置く。
 * OAuth 2.1 で発行するアクセストークンも同じ表に入り、同じ `authenticate` で確かめる（oauth.service.ts）。
 */

const TOKEN_PREFIX = "ptf_";
/** 管理画面で発行できるトークンの数（AI ツールごとに 1 本あれば足りる） */
const MAX_PERSONAL_TOKENS = 10;
const MAX_LABEL_LENGTH = 60;
/** last_used_at を書く間隔（毎回書くと D1 の書き込みが増えるだけ） */
const TOUCH_INTERVAL_MS = 60 * 1000;

interface IssuedToken {
  readonly id: string;
  /** 平文。発行したときだけ返す */
  readonly token: string;
  readonly label: string;
  readonly prefix: string;
  readonly createdAt: string;
}

/** 画面に出すトークン（平文は含まない） */
type ApiTokenView = Omit<ApiToken, "userId" | "audience">;

interface AuthenticatedToken {
  readonly user: McpUser;
  readonly token: ApiToken;
  readonly scopes: ReadonlySet<ApiScope>;
}

type IssueResult = { readonly status: "ok"; readonly token: IssuedToken } | { readonly status: "invalid" | "too_many"; readonly message: string };

/** OAuth のリフレッシュトークン側。アクセストークンを失効するとき、対になる family も失効する */
interface RefreshTokenFamilies {
  findFamilyByAccessTokenId(accessTokenId: string): Promise<{ readonly familyId: string; readonly userId: number } | null>;
  /** family を消し、その family で発行したアクセストークンの id を返す */
  deleteFamily(familyId: string): Promise<readonly string[]>;
  /** まだ使えるリフレッシュトークンと対になるアクセストークンの id */
  listLiveAccessTokenIds(userId: number, now: string): Promise<readonly string[]>;
}

interface ApiTokenServiceDeps {
  readonly tokens: ApiTokenRepository;
  readonly users: McpUserLookup;
  readonly refreshTokens?: RefreshTokenFamilies;
  readonly now?: () => Date;
}

export function createApiTokenService(deps: ApiTokenServiceDeps) {
  const now = deps.now ?? (() => new Date());

  return {
    async issue(userId: number, rawLabel: unknown): Promise<IssueResult> {
      const label = labelOf(rawLabel);

      if (label === null) {
        return { status: "invalid", message: `名前は ${MAX_LABEL_LENGTH} 文字までです。` };
      }

      const plain = `${TOKEN_PREFIX}${randomToken()}`;
      const createdAt = now().toISOString();
      const token: ApiToken = {
        id: await hashToken(plain),
        userId,
        kind: "personal",
        label,
        prefix: prefixOf(plain),
        clientId: null,
        scope: API_SCOPES.join(" "),
        audience: null,
        createdAt,
        lastUsedAt: null,
        expiresAt: null,
      };

      if (!(await deps.tokens.saveIfBelow(token, MAX_PERSONAL_TOKENS))) {
        return { status: "too_many", message: `トークンは ${MAX_PERSONAL_TOKENS} 本までです。使っていないものを失効してください。` };
      }

      return { status: "ok", token: { id: token.id, token: plain, label, prefix: token.prefix, createdAt } };
    },

    /** 本人のトークン。OAuth のアクセストークンは期限切れでもリフレッシュトークンが生きていれば出す（失効できるように） */
    async list(userId: number): Promise<ApiTokenView[]> {
      const current = now();
      const liveRefresh = new Set(deps.refreshTokens ? await deps.refreshTokens.listLiveAccessTokenIds(userId, current.toISOString()) : []);

      return (await deps.tokens.list(userId))
        .filter((token) => !isExpired(token, current) || (token.kind === "oauth" && liveRefresh.has(token.id)))
        .map((token) => ({
          id: token.id,
          kind: token.kind,
          label: token.label,
          prefix: token.prefix,
          clientId: token.clientId,
          scope: token.scope,
          createdAt: token.createdAt,
          lastUsedAt: token.lastUsedAt,
          expiresAt: token.expiresAt,
        }));
    },

    /** 失効する。本人のトークンでなければ false。OAuth のトークンなら対になるリフレッシュトークンの family も消す */
    async revoke(userId: number, id: string): Promise<boolean> {
      const token = await deps.tokens.find(id);
      const family = deps.refreshTokens && (token === null || token.kind === "oauth") ? await deps.refreshTokens.findFamilyByAccessTokenId(id) : null;

      if ((token === null || token.userId !== userId) && (family === null || family.userId !== userId)) {
        return false;
      }

      if (family && deps.refreshTokens) {
        for (const accessTokenId of await deps.refreshTokens.deleteFamily(family.familyId)) {
          await deps.tokens.delete(userId, accessTokenId);
        }
      }

      await deps.tokens.delete(userId, id);
      return true;
    },

    /**
     * `Authorization: Bearer …` のトークンを確かめる。
     * 期限切れ・失効済み・管理者でない・resource（audience）が違うときは null。
     */
    async authenticate(authorization: string | null, resource: string): Promise<AuthenticatedToken | null> {
      const plain = bearerOf(authorization);

      if (plain === null) {
        return null;
      }

      const token = await deps.tokens.find(await hashToken(plain));
      const current = now();

      if (token === null || isExpired(token, current)) {
        return null;
      }

      // OAuth の resource で結び付けたトークンは、その MCP エンドポイントでしか使えない
      if (token.audience !== null && token.audience !== resource) {
        return null;
      }

      // OAuth のトークンは family（リフレッシュトークン）が生きている間だけ有効
      if (token.kind === "oauth" && (!deps.refreshTokens || !(await deps.refreshTokens.findFamilyByAccessTokenId(token.id)))) {
        return null;
      }

      const user = await deps.users.findAdmin(token.userId);

      if (user === null) {
        return null;
      }

      if (token.lastUsedAt === null || current.getTime() - Date.parse(token.lastUsedAt) >= TOUCH_INTERVAL_MS) {
        await deps.tokens.touch(token.id, current.toISOString());
      }

      return { user, token, scopes: scopesOf(token.scope) };
    },
  };
}

function isExpired(token: ApiToken, current: Date): boolean {
  return token.expiresAt !== null && Date.parse(token.expiresAt) <= current.getTime();
}

/** `Authorization: Bearer ptf_…` からトークンの平文を取り出す。形が違えば null */
function bearerOf(authorization: string | null): string | null {
  const match = /^Bearer\s+([A-Za-z0-9_-]{8,256})$/u.exec(authorization?.trim() ?? "");
  return match?.[1] ?? null;
}

function prefixOf(plain: string): string {
  return plain.slice(0, TOKEN_PREFIX.length + 4);
}

function scopesOf(scope: string): ReadonlySet<ApiScope> {
  return new Set(scope.split(/\s+/u).filter((item): item is ApiScope => (API_SCOPES as readonly string[]).includes(item)));
}

function labelOf(input: unknown): string | null {
  if (input === undefined || input === null || input === "") {
    return "AI ツール";
  }

  if (typeof input !== "string" || input.trim() === "" || input.length > MAX_LABEL_LENGTH) {
    return null;
  }

  return input.trim();
}
