import { describe, expect, it } from "vitest";

import { createApiTokenService } from "./api-token.service";
import { MemoryApiTokenRepository } from "./memory-repositories";

const RESOURCE = "https://portfolio.example/api/mcp";

function setup(adminIds: readonly number[] = [1]) {
  const tokens = new MemoryApiTokenRepository();
  const service = createApiTokenService({
    tokens,
    users: { findAdmin: async (userId) => (adminIds.includes(userId) ? { id: userId, name: "Admin", email: "admin@example.com" } : null) },
  });
  return { tokens, service };
}

describe("個人トークン", () => {
  it("発行した平文で認証でき、保存されるのはハッシュだけ", async () => {
    const { tokens, service } = setup();
    const issued = await service.issue(1, "Claude Code");
    if (issued.status !== "ok") throw new Error("issue failed");

    expect(issued.token.token).toMatch(/^ptf_[A-Za-z0-9_-]{43}$/);
    expect(tokens.rows.has(issued.token.token)).toBe(false);
    expect(tokens.rows.get(issued.token.id)?.prefix).toBe(issued.token.token.slice(0, 8));

    const auth = await service.authenticate(`Bearer ${issued.token.token}`, RESOURCE);
    expect(auth?.user.id).toBe(1);
    expect(auth?.scopes.has("portfolio:write")).toBe(true);
  });

  it("形の違う Authorization や知らないトークンは null", async () => {
    const { service } = setup();
    expect(await service.authenticate(null, RESOURCE)).toBeNull();
    expect(await service.authenticate("Basic abc", RESOURCE)).toBeNull();
    expect(await service.authenticate("Bearer ptf_unknown_token_value", RESOURCE)).toBeNull();
  });

  it("管理者でなくなった利用者のトークンは使えない", async () => {
    const { service } = setup([1]);
    const issued = await service.issue(2, "x");
    if (issued.status !== "ok") throw new Error("issue failed");
    expect(await service.authenticate(`Bearer ${issued.token.token}`, RESOURCE)).toBeNull();
  });

  it("ラベルの検査と、本数の上限", async () => {
    const { service } = setup();
    expect((await service.issue(1, "a".repeat(61))).status).toBe("invalid");
    expect(await service.issue(1, undefined)).toMatchObject({ status: "ok", token: { label: "AI ツール" } });

    for (let index = 1; index < 10; index += 1) {
      expect((await service.issue(1, `t${index}`)).status).toBe("ok");
    }

    expect((await service.issue(1, "over")).status).toBe("too_many");
  });

  it("失効は本人のトークンだけ", async () => {
    const { service } = setup([1, 2]);
    const issued = await service.issue(1, "x");
    if (issued.status !== "ok") throw new Error("issue failed");

    expect(await service.revoke(2, issued.token.id)).toBe(false);
    expect(await service.revoke(1, issued.token.id)).toBe(true);
    expect(await service.authenticate(`Bearer ${issued.token.token}`, RESOURCE)).toBeNull();
    expect(await service.list(1)).toEqual([]);
  });
});
