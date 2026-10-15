import { getMcpAuthServices } from "@worker/lib/mcp-auth/services";
import { corsPreflight, oauthError, oauthJson } from "@worker/lib/mcp-auth/oauth-http";

/** RFC 7591: クライアントの動的登録（公開クライアントのみ） */
export async function POST(request: Request): Promise<Response> {
  const { oauth } = await getMcpAuthServices();
  const result = await oauth.register(await request.json().catch(() => null));
  return result.status === "ok" ? oauthJson(result.client, 201) : oauthError(result.body);
}

export function OPTIONS(): Response {
  return corsPreflight();
}
