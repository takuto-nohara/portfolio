import { createHash, randomBytes } from "node:crypto";

import { beforeEach, describe, expect, it } from "vitest";

import { createApiTokenService } from "./api-token.service";
import { MemoryApiTokenRepository, MemoryOauthClientRepository, MemoryOauthCodeRepository, MemoryOauthRefreshTokenRepository } from "./memory-repositories";
import { createOauthService } from "./oauth.service";

const ORIGIN = "https://portfolio.example";
const RESOURCE = `${ORIGIN}/api/mcp`;
const REDIRECT = "https://chatgpt.com/connector_platform_oauth_redirect";
const ADMIN = { id: 1, name: "Admin", email: "admin@example.com" };

function pkcePair() {
  const verifier = randomBytes(32).toString("base64url");
  return { verifier, challenge: createHash("sha256").update(verifier).digest("base64url") };
}

function setup() {
  let current = new Date("2026-10-16T00:00:00.000Z");
  const now = () => current;
  const tokens = new MemoryApiTokenRepository();
  const refreshTokens = new MemoryOauthRefreshTokenRepository(tokens);
  const oauth = createOauthService({
    clients: new MemoryOauthClientRepository(),
    codes: new MemoryOauthCodeRepository(),
    refreshTokens,
    tokens,
    now,
    fetch: () => Promise.reject(new Error("no network")),
  });
  const apiTokens = createApiTokenService({
    tokens,
    users: { findAdmin: async (userId) => (userId === ADMIN.id ? ADMIN : null) },
    refreshTokens: {
      findFamilyByAccessTokenId: (id) => refreshTokens.findByAccessTokenId(id),
      deleteFamily: (id) => refreshTokens.deleteFamily(id),
      listLiveAccessTokenIds: (userId, at) => refreshTokens.listLiveAccessTokenIds(userId, at),
    },
    now,
  });

  return { oauth, apiTokens, tokens, advance: (ms: number) => (current = new Date(current.getTime() + ms)) };
}

/** 登録 → 認可 → 同意 → コードの交換まで進める */
async function authorize(env: ReturnType<typeof setup>, scope?: string) {
  const registered = await env.oauth.register({ client_name: "ChatGPT", redirect_uris: [REDIRECT] });
  if (registered.status !== "ok") throw new Error("register failed");
  const clientId = registered.client.client_id as string;
  const { verifier, challenge } = pkcePair();
  const prepared = await env.oauth.prepareAuthorization(
    { client_id: clientId, redirect_uri: REDIRECT, response_type: "code", code_challenge: challenge, code_challenge_method: "S256", state: "s1", resource: RESOURCE, scope },
    ORIGIN,
  );
  if (prepared.status !== "ok") throw new Error(`prepare failed: ${JSON.stringify(prepared)}`);
  const code = await env.oauth.issueCode(ADMIN.id, prepared.request);
  const exchanged = await env.oauth.exchange({ grant_type: "authorization_code", code, client_id: clientId, redirect_uri: REDIRECT, code_verifier: verifier, resource: RESOURCE }, ORIGIN);
  return { clientId, code, verifier, exchanged };
}

describe("OAuth 2.1 の認可サーバー", () => {
  let env: ReturnType<typeof setup>;

  beforeEach(() => {
    env = setup();
  });

  it("認可コードを交換したアクセストークンで MCP に入れる", async () => {
    const { exchanged } = await authorize(env);
    expect(exchanged.status).toBe("ok");
    if (exchanged.status !== "ok") return;

    expect(exchanged.tokens.scope).toBe("portfolio:read portfolio:write");
    const auth = await env.apiTokens.authenticate(`Bearer ${exchanged.tokens.access_token}`, RESOURCE);
    expect(auth?.user).toEqual(ADMIN);
    expect([...(auth?.scopes ?? [])]).toEqual(["portfolio:read", "portfolio:write"]);
    // resource に結び付いたトークンは別のエンドポイントでは使えない
    expect(await env.apiTokens.authenticate(`Bearer ${exchanged.tokens.access_token}`, "https://other.example/api/mcp")).toBeNull();
  });

  it("認可コードは 1 回だけ、PKCE が合わなければ交換できない", async () => {
    const { clientId, code, verifier } = await authorize(env);
    const reused = await env.oauth.exchange({ grant_type: "authorization_code", code, client_id: clientId, code_verifier: verifier }, ORIGIN);
    expect(reused.status).toBe("error");

    const other = await authorize(env);
    const prepared = await env.oauth.prepareAuthorization(
      { client_id: other.clientId, redirect_uri: REDIRECT, response_type: "code", code_challenge: pkcePair().challenge },
      ORIGIN,
    );
    if (prepared.status !== "ok") throw new Error("prepare failed");
    const code2 = await env.oauth.issueCode(ADMIN.id, prepared.request);
    const wrongVerifier = await env.oauth.exchange({ grant_type: "authorization_code", code: code2, client_id: other.clientId, code_verifier: pkcePair().verifier }, ORIGIN);
    expect(wrongVerifier).toMatchObject({ status: "error", body: { error: "invalid_grant" } });
  });

  it("偽の code_verifier で送られても、認可コードは消えない", async () => {
    const registered = await env.oauth.register({ redirect_uris: [REDIRECT] });
    if (registered.status !== "ok") throw new Error("register failed");
    const clientId = registered.client.client_id as string;
    const { verifier, challenge } = pkcePair();
    const prepared = await env.oauth.prepareAuthorization({ client_id: clientId, response_type: "code", code_challenge: challenge }, ORIGIN);
    if (prepared.status !== "ok") throw new Error("prepare failed");
    const code = await env.oauth.issueCode(ADMIN.id, prepared.request);

    const attacker = await env.oauth.exchange({ grant_type: "authorization_code", code, client_id: clientId, code_verifier: pkcePair().verifier }, ORIGIN);
    expect(attacker).toMatchObject({ status: "error", body: { error: "invalid_grant" } });

    const legitimate = await env.oauth.exchange({ grant_type: "authorization_code", code, client_id: clientId, code_verifier: verifier }, ORIGIN);
    expect(legitimate.status).toBe("ok");
  });

  it("不正な要求は redirect_uri へ error を返すか、画面でエラーにする", async () => {
    expect(await env.oauth.prepareAuthorization({ client_id: "unknown" }, ORIGIN)).toMatchObject({ status: "invalid_client" });

    const registered = await env.oauth.register({ redirect_uris: [REDIRECT] });
    if (registered.status !== "ok") throw new Error("register failed");
    const clientId = registered.client.client_id as string;
    expect(await env.oauth.prepareAuthorization({ client_id: clientId, redirect_uri: "https://evil.example/cb" }, ORIGIN)).toMatchObject({ status: "invalid_client" });
    expect(await env.oauth.prepareAuthorization({ client_id: clientId, response_type: "code" }, ORIGIN)).toMatchObject({ status: "redirect_error", error: "invalid_request" });
    expect(
      await env.oauth.prepareAuthorization({ client_id: clientId, response_type: "code", code_challenge: pkcePair().challenge, scope: "admin:all" }, ORIGIN),
    ).toMatchObject({ status: "redirect_error", error: "invalid_scope" });
    expect(
      await env.oauth.prepareAuthorization({ client_id: clientId, response_type: "code", code_challenge: pkcePair().challenge, resource: "https://other.example/api/mcp" }, ORIGIN),
    ).toMatchObject({ status: "redirect_error", error: "invalid_target" });
  });

  it("動的登録は https かループバックの redirect_uri だけ", async () => {
    expect((await env.oauth.register({ redirect_uris: ["http://evil.example/cb"] })).status).toBe("error");
    expect((await env.oauth.register({ redirect_uris: ["http://127.0.0.1:6274/oauth/callback"] })).status).toBe("ok");
    expect((await env.oauth.register({ redirect_uris: [REDIRECT], token_endpoint_auth_method: "client_secret_basic" })).status).toBe("error");
  });

  it("リフレッシュトークンは回転し、使い回しを検知したら family ごと失効する", async () => {
    const { clientId, exchanged } = await authorize(env);
    if (exchanged.status !== "ok") throw new Error("exchange failed");
    const first = exchanged.tokens;

    const rotated = await env.oauth.exchange({ grant_type: "refresh_token", refresh_token: first.refresh_token, client_id: clientId }, ORIGIN);
    if (rotated.status !== "ok") throw new Error("refresh failed");
    expect(rotated.tokens.refresh_token).not.toBe(first.refresh_token);
    // 古いアクセストークンは回転で消える
    expect(await env.apiTokens.authenticate(`Bearer ${first.access_token}`, RESOURCE)).toBeNull();
    expect(await env.apiTokens.authenticate(`Bearer ${rotated.tokens.access_token}`, RESOURCE)).not.toBeNull();

    // 使い終えたリフレッシュトークンがもう一度使われた → 盗用とみなして新しい組も失効
    const replay = await env.oauth.exchange({ grant_type: "refresh_token", refresh_token: first.refresh_token }, ORIGIN);
    expect(replay).toMatchObject({ status: "error", body: { error: "invalid_grant" } });
    expect(await env.apiTokens.authenticate(`Bearer ${rotated.tokens.access_token}`, RESOURCE)).toBeNull();
    expect((await env.oauth.exchange({ grant_type: "refresh_token", refresh_token: rotated.tokens.refresh_token }, ORIGIN)).status).toBe("error");
  });

  it("リフレッシュで scope は狭められるが広げられない", async () => {
    const { exchanged } = await authorize(env, "portfolio:read");
    if (exchanged.status !== "ok") throw new Error("exchange failed");
    const widened = await env.oauth.exchange({ grant_type: "refresh_token", refresh_token: exchanged.tokens.refresh_token, scope: "portfolio:read portfolio:write" }, ORIGIN);
    expect(widened).toMatchObject({ status: "error", body: { error: "invalid_scope" } });
  });

  it("アクセストークンは 1 時間で切れる", async () => {
    const { exchanged } = await authorize(env);
    if (exchanged.status !== "ok") throw new Error("exchange failed");
    env.advance(61 * 60 * 1000);
    expect(await env.apiTokens.authenticate(`Bearer ${exchanged.tokens.access_token}`, RESOURCE)).toBeNull();
  });

  it("失効（RFC 7009）と管理画面からの失効で family ごと使えなくなる", async () => {
    const first = await authorize(env);
    if (first.exchanged.status !== "ok") throw new Error("exchange failed");
    await env.oauth.revoke(first.exchanged.tokens.access_token);
    expect(await env.apiTokens.authenticate(`Bearer ${first.exchanged.tokens.access_token}`, RESOURCE)).toBeNull();
    expect((await env.oauth.exchange({ grant_type: "refresh_token", refresh_token: first.exchanged.tokens.refresh_token }, ORIGIN)).status).toBe("error");

    const second = await authorize(env);
    if (second.exchanged.status !== "ok") throw new Error("exchange failed");
    const listed = await env.apiTokens.list(ADMIN.id);
    const oauthToken = listed.find((token) => token.kind === "oauth");
    expect(oauthToken?.label).toBe("ChatGPT");
    expect(await env.apiTokens.revoke(ADMIN.id, oauthToken?.id ?? "")).toBe(true);
    expect((await env.oauth.exchange({ grant_type: "refresh_token", refresh_token: second.exchanged.tokens.refresh_token }, ORIGIN)).status).toBe("error");
  });
});
