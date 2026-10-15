import { getAdminServices } from "@worker/lib/api/services";
import { getMcpAuthServices } from "@worker/lib/mcp-auth/services";
import type { ApiScope } from "@worker/lib/mcp-auth/types";

import {
  LEGACY_PROTOCOL_VERSIONS,
  metaProtocolVersion,
  MODERN_PROTOCOL_VERSION,
  negotiateLegacyVersion,
  parseRpcMessage,
  RPC_ERROR,
  RpcError,
  rpcFailure,
  rpcResult,
  SUPPORTED_PROTOCOL_VERSIONS,
  type RpcMessage,
} from "./json-rpc";
import type { ToolContext } from "./tool";
import { callTool, describeTools } from "./tools";

/**
 * MCP サーバー（POST /api/mcp）。AI ツール（ChatGPT・Claude・dots など）からポートフォリオを管理するための口。
 *
 * 認証は Authorization: Bearer のアクセストークンだけ（Cookie は使わない。ブラウザから叩かれても何もできないように）。
 * プロトコルは 2026-07-28（ステートレス。server/discover から始まる）と、それ以前（initialize から始まる）の両方に応える。
 * 応答は常に JSON 1 つ（SSE やセッション ID は使わない）。
 */

const SERVER_INFO = { name: "portfolio", title: "Portfolio Admin", version: "1.0.0" };

const INSTRUCTIONS = [
  "このサーバーは、個人ポートフォリオサイトの管理画面と同じ操作（作品・ギャラリー画像・制作区分・お問い合わせ・サイト設定）を行えます。",
  "- まず get_site_overview でサイトの全体像（プロフィール・媒体カテゴリ・制作区分・件数）を確認してください。",
  "- 作品は create_work で登録します。title・category・description が必須です。制作区分は list_context_categories の id を contextCategoryId に指定します。",
  "- 画像（サムネイル・ギャラリー）は公開 URL（https）か base64 で渡せます。1 枚 10MB まで、画像形式のみです。",
  "- 作品は登録した時点で公開サイトに表示されます。delete_work・delete_work_image・delete_context_category・delete_contact は取り消せないので、必ず利用者に確認してから呼んでください。",
  "- プロフィール・スキル・経歴はサイトのコード内の固定値なので、MCP からは変更できません。",
].join("\n");

/** tools/list の結果を AI ツールが手元に置いてよい時間 */
const TOOLS_TTL_MS = 5 * 60 * 1000;

/** MCP-Protocol-Version の時代。modern は 2026-07-28、legacy は initialize から始める版 */
type Era = { readonly kind: "modern" } | { readonly kind: "legacy"; readonly version: string };

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

function mcpResourceUrl(origin: string): string {
  return `${origin}/api/mcp`;
}

export async function handleMcp(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");

  if (origin !== null && origin !== url.origin) {
    // ブラウザからの越境リクエスト（DNS rebinding など）。MCP は AI ツールから直接叩かれる前提
    return json({ error: "この Origin からは MCP を使えません。" }, 403);
  }

  const { apiTokens } = await getMcpAuthServices();
  const auth = await apiTokens.authenticate(request.headers.get("Authorization"), mcpResourceUrl(url.origin));

  if (auth === null) {
    return json(
      { error: "アクセストークンが必要です。管理画面のサイト設定「MCP 連携」で発行したトークンを Authorization: Bearer で送るか、OAuth で接続してください。" },
      401,
      { "WWW-Authenticate": `Bearer resource_metadata="${url.origin}/.well-known/oauth-protected-resource/api/mcp"` },
    );
  }

  let message: RpcMessage;

  try {
    message = parseRpcMessage(await request.json());
  } catch (error) {
    const failure = error instanceof RpcError ? error.toFailure() : { code: RPC_ERROR.parse, message: "JSON を送ってください。" };
    return json(rpcFailure(null, failure), 400);
  }

  const era = detectEra(request, message);

  if (era instanceof RpcError) {
    return json(rpcFailure(message.id ?? null, era.toFailure()), 400);
  }

  const headers = { "MCP-Protocol-Version": era.kind === "modern" ? MODERN_PROTOCOL_VERSION : era.version };

  if (message.id === undefined) {
    // 通知（notifications/initialized など）。受け取ったことだけ返す
    return new Response(null, { status: 202, headers });
  }

  try {
    const context: ToolContext = { services: await getAdminServices(), user: auth.user, origin: url.origin };
    const result = await dispatch(message, era, context, auth.scopes);

    if (era.kind === "modern") {
      result.resultType = "complete";
    }

    return json(rpcResult(message.id, result), 200, headers);
  } catch (error) {
    if (!(error instanceof RpcError)) {
      console.error("MCP の処理に失敗しました", error instanceof Error ? error.message : String(error));
      return json(rpcFailure(message.id, { code: RPC_ERROR.internal, message: "処理に失敗しました。" }), era.kind === "modern" ? 500 : 200, headers);
    }

    return json(rpcFailure(message.id, error.toFailure()), era.kind === "modern" ? httpStatusOf(error.code) : 200, headers);
  }
}

/** GET（SSE の購読）と DELETE（セッションの終了）は旧版の作法。セッションを持たないので受けない */
export function handleMcpMethodNotAllowed(): Response {
  return json({ error: "MCP は POST だけを受け付けます（セッションや SSE はありません）。" }, 405, { Allow: "POST" });
}

/**
 * どの時代の作法で来ているかを決める。2026-07-28 ではヘッダと _meta の両方に版があり、一致していなければならない。
 * ヘッダが旧版（または無し）なら旧版の作法（無ければ 2025-03-26 とみなすのが旧版の決まり）
 */
function detectEra(request: Request, message: RpcMessage): Era | RpcError {
  const header = request.headers.get("MCP-Protocol-Version");
  const meta = metaProtocolVersion(message);

  if (header === MODERN_PROTOCOL_VERSION || meta === MODERN_PROTOCOL_VERSION) {
    if (header !== meta) {
      return new RpcError(RPC_ERROR.headerMismatch, "MCP-Protocol-Version ヘッダと params._meta の版が一致しません。", { header, meta });
    }

    const method = request.headers.get("Mcp-Method");

    if (method !== null && method !== message.method) {
      return new RpcError(RPC_ERROR.headerMismatch, "Mcp-Method ヘッダと method が一致しません。", { header: method, method: message.method });
    }

    const name = request.headers.get("Mcp-Name");

    if (name !== null && name !== message.params.name) {
      return new RpcError(RPC_ERROR.headerMismatch, "Mcp-Name ヘッダと params.name が一致しません。", { header: name, name: message.params.name });
    }

    return { kind: "modern" };
  }

  if (header !== null && !SUPPORTED_PROTOCOL_VERSIONS.includes(header)) {
    return new RpcError(RPC_ERROR.unsupportedProtocolVersion, `対応していないプロトコルの版です: ${header}`, { supported: SUPPORTED_PROTOCOL_VERSIONS });
  }

  return { kind: "legacy", version: header ?? LEGACY_PROTOCOL_VERSIONS[LEGACY_PROTOCOL_VERSIONS.length - 1] ?? "2025-03-26" };
}

async function dispatch(message: RpcMessage, era: Era, context: ToolContext, scopes: ReadonlySet<ApiScope>): Promise<Record<string, unknown>> {
  switch (message.method) {
    case "server/discover":
      return {
        supportedVersions: SUPPORTED_PROTOCOL_VERSIONS,
        serverInfo: SERVER_INFO,
        capabilities: { tools: {} },
        instructions: INSTRUCTIONS,
      };
    case "initialize":
      if (era.kind === "modern") {
        break;
      }

      return { protocolVersion: negotiateLegacyVersion(message.params.protocolVersion), capabilities: { tools: {} }, serverInfo: SERVER_INFO, instructions: INSTRUCTIONS };
    case "ping":
      return {};
    case "tools/list":
      return era.kind === "modern" ? { tools: describeTools(), ttlMs: TOOLS_TTL_MS, cacheScope: "private" } : { tools: describeTools() };
    case "tools/call":
      return { ...(await callTool(message.params, scopes, context)) };
    default:
      break;
  }

  throw new RpcError(RPC_ERROR.methodNotFound, `未知のメソッドです: ${message.method}`);
}

/** 2026-07-28 ではエラーの種類を HTTP の状態でも表す */
function httpStatusOf(code: number): number {
  switch (code) {
    case RPC_ERROR.methodNotFound:
      return 404;
    case RPC_ERROR.internal:
      return 500;
    default:
      return 400;
  }
}
