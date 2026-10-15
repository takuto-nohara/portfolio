import { describe, expect, it } from "vitest";

import { metaProtocolVersion, negotiateLegacyVersion, parseRpcMessage, RPC_ERROR, RpcError } from "./json-rpc";

describe("parseRpcMessage", () => {
  it("リクエストと通知を読む", () => {
    expect(parseRpcMessage({ jsonrpc: "2.0", id: 1, method: "tools/list" })).toEqual({ id: 1, method: "tools/list", params: {} });
    expect(parseRpcMessage({ jsonrpc: "2.0", method: "notifications/initialized" }).id).toBeUndefined();
  });

  it.each([
    [[{ jsonrpc: "2.0", id: 1, method: "ping" }], RPC_ERROR.invalidMessage],
    [{ jsonrpc: "1.0", id: 1, method: "ping" }, RPC_ERROR.invalidMessage],
    [{ jsonrpc: "2.0", id: {}, method: "ping" }, RPC_ERROR.invalidMessage],
    [{ jsonrpc: "2.0", id: 1, method: "ping", params: [] }, RPC_ERROR.invalidParams],
  ])("不正なメッセージは RpcError（%#）", (body, code) => {
    expect(() => parseRpcMessage(body)).toThrowError(RpcError);
    try {
      parseRpcMessage(body);
    } catch (error) {
      expect((error as RpcError).code).toBe(code);
    }
  });
});

describe("プロトコルの版", () => {
  it("_meta の版を読む", () => {
    const message = parseRpcMessage({ jsonrpc: "2.0", id: 1, method: "server/discover", params: { _meta: { "io.modelcontextprotocol/protocolVersion": "2026-07-28" } } });
    expect(metaProtocolVersion(message)).toBe("2026-07-28");
  });

  it("initialize の版は知っていればそのまま、知らなければ 2025-06-18", () => {
    expect(negotiateLegacyVersion("2025-11-25")).toBe("2025-11-25");
    expect(negotiateLegacyVersion("2099-01-01")).toBe("2025-06-18");
    expect(negotiateLegacyVersion(undefined)).toBe("2025-06-18");
  });
});
