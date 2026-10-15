import { getMcpAuthServices } from "@worker/lib/mcp-auth/services";
import { corsPreflight, oauthError, oauthJson, readForm } from "@worker/lib/mcp-auth/oauth-http";

/** RFC 7009: トークンの失効 */
export async function POST(request: Request): Promise<Response> {
  const { token } = await readForm(request);

  if (!token) {
    return oauthError({ error: "invalid_request", error_description: "token を指定してください。" });
  }

  const { oauth } = await getMcpAuthServices();
  await oauth.revoke(token);
  return oauthJson({});
}

export function OPTIONS(): Response {
  return corsPreflight();
}
