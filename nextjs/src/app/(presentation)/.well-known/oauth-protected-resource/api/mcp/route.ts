import { getMcpAuthServices } from "@worker/lib/mcp-auth/services";
import { corsPreflight, oauthJson } from "@worker/lib/mcp-auth/oauth-http";

/** RFC 9728: /api/mcp を守る認可サーバーの案内（401 の WWW-Authenticate から辿られる） */
export async function GET(request: Request): Promise<Response> {
  const { oauth } = await getMcpAuthServices();
  return oauthJson(oauth.resourceMetadata(new URL(request.url).origin), 200, { "Cache-Control": "public, max-age=3600" });
}

export function OPTIONS(): Response {
  return corsPreflight();
}
