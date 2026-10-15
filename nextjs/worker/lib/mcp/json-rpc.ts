/**
 * MCP（Model Context Protocol）の JSON-RPC の形と、プロトコル版の扱い。
 *
 * MCP は 2026-07-28 でセッションと `initialize` のやり取りを無くし、各リクエストがヘッダと
 * `params._meta` に版を持つ作りになった。それより前（2025-11-25 以前）のクライアントは `initialize` から始める。
 * このサーバーはどちらにも応える。
 */

/** 2026-07-28 の版。各リクエストが `MCP-Protocol-Version` ヘッダと `_meta` に版を持つ */
export const MODERN_PROTOCOL_VERSION = "2026-07-28";
/** `initialize` から始める版。新しい順 */
export const LEGACY_PROTOCOL_VERSIONS: readonly string[] = ["2025-11-25", "2025-06-18", "2025-03-26"];
export const SUPPORTED_PROTOCOL_VERSIONS: readonly string[] = [MODERN_PROTOCOL_VERSION, ...LEGACY_PROTOCOL_VERSIONS];
const PROTOCOL_VERSION_META = "io.modelcontextprotocol/protocolVersion";

/** JSON-RPC 2.0 のエラーコード（MCP が足したものを含む） */
export const RPC_ERROR = {
  parse: -32700,
  invalidMessage: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  internal: -32603,
  /** 2026-07-28: ヘッダと本文の版・メソッドが食い違う */
  headerMismatch: -32020,
  /** 2026-07-28: 対応していない版 */
  unsupportedProtocolVersion: -32022,
} as const;

export type RpcId = string | number | null;

/** 受け取った JSON-RPC のメッセージ（リクエストか通知）。id が無ければ通知 */
export interface RpcMessage {
  readonly id: RpcId | undefined;
  readonly method: string;
  readonly params: Record<string, unknown>;
}

interface RpcFailure {
  readonly code: number;
  readonly message: string;
  readonly data?: unknown;
}

export class RpcError extends Error {
  constructor(
    readonly code: number,
    message: string,
    readonly data?: unknown,
  ) {
    super(message);
    this.name = "RpcError";
  }

  toFailure(): RpcFailure {
    return this.data === undefined ? { code: this.code, message: this.message } : { code: this.code, message: this.message, data: this.data };
  }
}

/** 本文（JSON）を JSON-RPC のメッセージとして読む。配列（バッチ）は受けない */
export function parseRpcMessage(body: unknown): RpcMessage {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new RpcError(RPC_ERROR.invalidMessage, "JSON-RPC のメッセージを 1 つだけ送ってください（配列は受け付けません）");
  }

  const { jsonrpc, id, method, params } = body as Record<string, unknown>;

  if (jsonrpc !== "2.0" || typeof method !== "string" || method === "") {
    throw new RpcError(RPC_ERROR.invalidMessage, 'jsonrpc: "2.0" と method を指定してください');
  }

  if (id !== undefined && id !== null && typeof id !== "string" && typeof id !== "number") {
    throw new RpcError(RPC_ERROR.invalidMessage, "id は文字列か数値にしてください");
  }

  if (params !== undefined && (typeof params !== "object" || params === null || Array.isArray(params))) {
    throw new RpcError(RPC_ERROR.invalidParams, "params はオブジェクトにしてください");
  }

  return { id: id as RpcId | undefined, method, params: (params ?? {}) as Record<string, unknown> };
}

/** `params._meta` に書かれたプロトコルの版（2026-07-28 以降のクライアントが付ける） */
export function metaProtocolVersion(message: RpcMessage): string | null {
  const meta = message.params._meta;
  const version = typeof meta === "object" && meta !== null ? (meta as Record<string, unknown>)[PROTOCOL_VERSION_META] : undefined;
  return typeof version === "string" ? version : null;
}

/** `initialize` で名乗られた版に応える版。知っている版ならそのまま、知らなければ 2025-06-18 */
export function negotiateLegacyVersion(requested: unknown): string {
  return typeof requested === "string" && LEGACY_PROTOCOL_VERSIONS.includes(requested) ? requested : "2025-06-18";
}

export function rpcResult(id: RpcId, result: unknown): Record<string, unknown> {
  return { jsonrpc: "2.0", id, result };
}

export function rpcFailure(id: RpcId, failure: RpcFailure): Record<string, unknown> {
  return { jsonrpc: "2.0", id, error: failure };
}
