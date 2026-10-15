import { getMcpAuthServices } from "@worker/lib/mcp-auth/services";
import { corsPreflight, oauthError, oauthJson, readForm } from "@worker/lib/mcp-auth/oauth-http";

/** トークンエンドポイント（authorization_code と refresh_token） */
export async function POST(request: Request): Promise<Response> {
  const { oauth } = await getMcpAuthServices();
  const result = await oauth.exchange(await readForm(request), new URL(request.url).origin);
  return result.status === "ok" ? oauthJson(result.tokens) : oauthError(result.body);
}

export function OPTIONS(): Response {
  return corsPreflight();
}
