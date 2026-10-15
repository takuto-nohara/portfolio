import { AdminOperationError } from "@/application/publicApi";
import type { ApiScope } from "@worker/lib/mcp-auth/types";

import { RPC_ERROR, RpcError } from "./json-rpc";
import { validateJson } from "./json-schema";
import { fail, type McpTool, type ToolContext, type ToolResult } from "./tool";
import { READ_TOOLS } from "./tools-read";
import { WORK_TOOLS } from "./tools-works";

/**
 * MCP のツール一覧（tools/list）と呼び出し（tools/call）。
 *
 * 管理画面でできる操作をすべて出す。ただし Google アカウントの連携はブラウザでのリダイレクトが要るので出さない
 * （状態は get_settings で見られる）。プロフィール・スキル・経歴はコード内の固定値なので参照だけ。
 */

const MCP_TOOLS: readonly McpTool[] = [...READ_TOOLS, ...WORK_TOOLS];

const TOOLS_BY_NAME = new Map(MCP_TOOLS.map((tool) => [tool.name, tool]));

/** tools/list の 1 件（run と scopes は出さない） */
export function describeTools(): Record<string, unknown>[] {
  return MCP_TOOLS.map(({ name, title, description, inputSchema, annotations }) => ({ name, title, description, inputSchema, annotations }));
}

/** tools/call。名前や引数の形が違えば JSON-RPC のエラー（-32602）、ツールが仕事を果たせなければ isError の結果 */
export async function callTool(params: Record<string, unknown>, scopes: ReadonlySet<ApiScope>, context: ToolContext): Promise<ToolResult> {
  const name = typeof params.name === "string" ? params.name : "";
  const tool = TOOLS_BY_NAME.get(name);

  if (tool === undefined) {
    throw new RpcError(RPC_ERROR.invalidParams, `未知のツールです: ${name}`);
  }

  const args = params.arguments ?? {};
  const problem = validateJson(tool.inputSchema, args);

  if (problem !== null) {
    throw new RpcError(RPC_ERROR.invalidParams, problem);
  }

  const missing = tool.scopes.filter((scope) => !scopes.has(scope));

  if (missing.length > 0) {
    return fail(`このトークンでは ${tool.name} を実行できません（${missing.join(" と ")} のスコープが必要です）。`);
  }

  try {
    return await tool.run({ ...context, args: args as Record<string, unknown> });
  } catch (error) {
    if (error instanceof AdminOperationError) {
      return fail(error.message);
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(`MCP のツール ${tool.name} が失敗しました`, message);
    return fail(`${tool.name} の実行に失敗しました: ${message}`);
  }
}
