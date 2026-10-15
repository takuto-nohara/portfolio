import { getMcpAuthServices } from "@worker/lib/mcp-auth/services";
import { corsPreflight, oauthJson } from "@worker/lib/mcp-auth/oauth-http";

/** RFC 8414: 認可サーバーの案内 */
export async function GET(request: Request): Promise<Response> {
  const { oauth } = await getMcpAuthServices();
  return oauthJson(oauth.serverMetadata(new URL(request.url).origin), 200, { "Cache-Control": "public, max-age=3600" });
}

export function OPTIONS(): Response {
  return corsPreflight();
}
