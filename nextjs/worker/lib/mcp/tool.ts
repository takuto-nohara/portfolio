import type { getAdminServices } from "@worker/lib/api/services";
import type { ApiScope, McpUser } from "@worker/lib/mcp-auth/types";

import type { JsonSchema } from "./json-schema";

/**
 * MCP のツールの形と、結果の組み立て。
 *
 * 結果は AI ツールが読む text と、構造を保った structuredContent の両方で返す。失敗は isError で伝え、
 * JSON-RPC のエラーにはしない（AI ツールが理由を読んで言い直せるように）。
 */

export type AdminServices = Awaited<ReturnType<typeof getAdminServices>>;

export interface ToolContext {
  readonly services: AdminServices;
  readonly user: McpUser;
  /** このサイトのオリジン（画像の URL を絶対 URL にするのに使う） */
  readonly origin: string;
}

/** ツールに渡すもの。args は inputSchema で検査済み */
export interface ToolInput extends ToolContext {
  readonly args: Record<string, unknown>;
}

export interface ToolResult {
  readonly content: { readonly type: "text"; readonly text: string }[];
  readonly structuredContent?: Record<string, unknown>;
  readonly isError?: boolean;
}

export interface McpTool {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly inputSchema: JsonSchema;
  /** 必要なスコープ（すべて要る） */
  readonly scopes: readonly ApiScope[];
  readonly annotations: {
    readonly readOnlyHint: boolean;
    readonly destructiveHint: boolean;
    readonly idempotentHint: boolean;
    readonly openWorldHint: boolean;
  };
  run(input: ToolInput): Promise<ToolResult>;
}

/** 読むだけのツール */
export const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

export const READ_SCOPE: readonly ApiScope[] = ["portfolio:read"];

export function ok(value: Record<string, unknown>): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value) }], structuredContent: value };
}

export function fail(message: string): ToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

/** 検査済みの引数から取り出す小さな関数群 */
export function stringArg(args: Record<string, unknown>, name: string): string | undefined {
  const value = args[name];
  return typeof value === "string" ? value : undefined;
}

export function numberArg(args: Record<string, unknown>, name: string): number | undefined {
  const value = args[name];
  return typeof value === "number" ? value : undefined;
}

export function booleanArg(args: Record<string, unknown>, name: string): boolean | undefined {
  const value = args[name];
  return typeof value === "boolean" ? value : undefined;
}

/** id 引数（1 以上の整数）のスキーマ */
export function idSchema(description: string): JsonSchema {
  return { type: "integer", minimum: 1, description };
}
