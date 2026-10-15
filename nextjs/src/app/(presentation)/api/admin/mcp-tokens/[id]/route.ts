import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getMcpAuthServices } from "@worker/lib/mcp-auth/services";
import { redirectWithStatus } from "@/presentation/lib/api/form-helpers";

/** MCP のトークン（個人トークン・OAuth で連携したクライアント）を失効する */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent("/admin/settings")}`, request.url));
  }

  const { id } = await context.params;

  try {
    const { apiTokens } = await getMcpAuthServices();
    const revoked = await apiTokens.revoke(session.userId, id);
    return redirectWithStatus(request, "/admin/settings", revoked ? "token-revoked" : "error");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "/admin/settings", "error");
  }
}
