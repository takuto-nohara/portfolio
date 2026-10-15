import { createHash, randomBytes } from "node:crypto";

import { expect, test, type APIRequestContext } from "@playwright/test";

/**
 * MCP サーバー（/api/mcp）と OAuth 2.1 の E2E テスト。
 * seed-mcp.sql の管理者（admin@example.com）と個人トークンを使う。
 * 管理者として通るには ADMIN_EMAILS に admin@example.com が含まれている（または未設定）必要がある。
 */

const SEED_TOKEN = "ptf_e2eTestTokenForLocalAndCiOnly000000000000";
const ADMIN = { email: "admin@example.com", password: "e2e-admin-password" };
// 1x1 の PNG
const PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

let rpcId = 0;

async function rpc(request: APIRequestContext, token: string | null, method: string, params?: Record<string, unknown>) {
  const response = await request.post("/api/mcp", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    data: { jsonrpc: "2.0", id: ++rpcId, method, params },
  });
  return { status: response.status(), headers: response.headers(), body: response.status() === 200 ? await response.json() : null };
}

// ツールの結果は JSON をそのまま読むので、テストでは型を緩める
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolJson = Record<string, any>;

async function callTool(request: APIRequestContext, token: string, name: string, args: Record<string, unknown>) {
  const { body } = await rpc(request, token, "tools/call", { name, arguments: args });
  return body.result as { structuredContent?: ToolJson; isError?: boolean; content: { text: string }[] };
}

async function login(request: APIRequestContext) {
  const response = await request.post("/api/auth/login", { data: { ...ADMIN, redirectTo: "/admin/settings" } });
  expect(response.status(), "seed-mcp.sql の管理者でログインできること（ADMIN_EMAILS を確認）").toBe(200);
}

test.describe("MCP サーバー", () => {
  test("トークンが無ければ 401 と OAuth の案内を返す", async ({ request }) => {
    const { status, headers } = await rpc(request, null, "tools/list");
    expect(status).toBe(401);
    expect(headers["www-authenticate"]).toContain("/.well-known/oauth-protected-resource/api/mcp");

    const metadata = await (await request.get("/.well-known/oauth-protected-resource/api/mcp")).json();
    expect(metadata.resource).toMatch(/\/api\/mcp$/);
    const server = await (await request.get("/.well-known/oauth-authorization-server")).json();
    expect(server.code_challenge_methods_supported).toEqual(["S256"]);
  });

  test("個人トークンで initialize・tools/list・作品の登録から削除まで", async ({ request }) => {
    const init = await rpc(request, SEED_TOKEN, "initialize", { protocolVersion: "2025-06-18" });
    expect(init.body.result.protocolVersion).toBe("2025-06-18");
    expect(init.body.result.serverInfo.name).toBe("portfolio");

    const list = await rpc(request, SEED_TOKEN, "tools/list");
    const names = (list.body.result.tools as { name: string }[]).map((tool) => tool.name);
    expect(names).toEqual(expect.arrayContaining(["get_site_overview", "create_work", "delete_work", "update_settings"]));

    const created = await callTool(request, SEED_TOKEN, "create_work", {
      title: "MCP E2E 作品",
      category: "web",
      description: "MCP から登録した作品",
      techStack: "Next.js, TypeScript",
      thumbnail: { base64: PNG_BASE64 },
      images: [{ image: { base64: `data:image/png;base64,${PNG_BASE64}` }, caption: "1 枚目" }],
    });
    expect(created.isError).toBeUndefined();
    const work = created.structuredContent?.work;
    expect(work.title).toBe("MCP E2E 作品");
    expect(work.images).toHaveLength(1);

    const asset = await request.get(work.thumbnailUrl);
    expect(asset.status()).toBe(200);
    expect(asset.headers()["content-type"]).toBe("image/png");

    const updated = await callTool(request, SEED_TOKEN, "update_work", { workId: work.id, lead: "一言説明", isFeatured: true });
    expect(updated.structuredContent?.work).toMatchObject({ lead: "一言説明", isFeatured: true, title: "MCP E2E 作品" });

    const page = await request.get(`/works/${work.id}`);
    expect(await page.text()).toContain("MCP E2E 作品");

    const deleted = await callTool(request, SEED_TOKEN, "delete_work", { workId: work.id });
    expect(deleted.structuredContent?.deleted.id).toBe(work.id);
    expect((await callTool(request, SEED_TOKEN, "get_work", { workId: work.id })).isError).toBe(true);
  });

  test("管理画面で発行したトークンは失効すると使えない", async ({ request }) => {
    await login(request);
    const issued = await request.post("/api/admin/mcp-tokens", { data: { label: "E2E 発行" } });
    expect(issued.status()).toBe(201);
    const { token } = (await issued.json()) as { token: { id: string; token: string } };

    expect((await rpc(request, token.token, "ping")).status).toBe(200);

    const revoked = await request.post(`/api/admin/mcp-tokens/${token.id}`, { maxRedirects: 0 });
    expect(revoked.status()).toBe(303);
    expect((await rpc(request, token.token, "ping")).status).toBe(401);
  });
});

test.describe("OAuth 2.1", () => {
  test("登録 → 同意 → トークン → MCP → 失効", async ({ request, baseURL }) => {
    const redirectUri = "http://localhost:6274/oauth/callback";
    const registered = await (await request.post("/api/oauth/register", { data: { client_name: "E2E Client", redirect_uris: [redirectUri] } })).json();
    const verifier = randomBytes(32).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const params = {
      client_id: registered.client_id,
      redirect_uri: redirectUri,
      response_type: "code",
      code_challenge: challenge,
      code_challenge_method: "S256",
      state: "e2e-state",
      resource: `${baseURL}/api/mcp`,
    };

    const authorize = await request.get(`/api/oauth/authorize?${new URLSearchParams(params)}`, { maxRedirects: 0 });
    expect(authorize.status()).toBe(302);
    expect(authorize.headers().location).toContain("/oauth/consent?");

    await login(request);
    const consent = await request.get(authorize.headers().location ?? "");
    expect(await consent.text()).toContain("E2E Client");

    const decision = await request.post("/api/oauth/authorize", { form: { ...params, decision: "allow" }, maxRedirects: 0 });
    expect(decision.status()).toBe(302);
    const callback = new URL(decision.headers().location ?? "");
    expect(callback.searchParams.get("state")).toBe("e2e-state");

    const tokenResponse = await request.post("/api/oauth/token", {
      form: { grant_type: "authorization_code", code: callback.searchParams.get("code") ?? "", client_id: registered.client_id, redirect_uri: redirectUri, code_verifier: verifier },
    });
    expect(tokenResponse.status()).toBe(200);
    const tokens = await tokenResponse.json();

    const works = await callTool(request, tokens.access_token, "list_works", {});
    expect(Array.isArray(works.structuredContent?.works)).toBe(true);

    const refreshed = await (await request.post("/api/oauth/token", { form: { grant_type: "refresh_token", refresh_token: tokens.refresh_token } })).json();
    expect(refreshed.access_token).toBeTruthy();
    expect((await rpc(request, tokens.access_token, "ping")).status).toBe(401);

    await request.post("/api/oauth/revoke", { form: { token: refreshed.refresh_token } });
    expect((await rpc(request, refreshed.access_token, "ping")).status).toBe(401);
  });
});
