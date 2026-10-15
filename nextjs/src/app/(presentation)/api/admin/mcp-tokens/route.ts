import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getMcpAuthServices } from "@worker/lib/mcp-auth/services";

/**
 * MCP 用の個人トークンを発行する。平文はこの応答でだけ返すので、画面から fetch で呼ぶ（JSON）。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "ログインしてください。" }, { status: 401 });
  }

  const origin = request.headers.get("origin");

  if (origin !== null && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "この Origin からは発行できません。" }, { status: 403 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { readonly label?: unknown };
    const { apiTokens } = await getMcpAuthServices();
    const result = await apiTokens.issue(session.userId, body.label);

    if (result.status !== "ok") {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ token: result.token }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "トークンを発行できませんでした。" }, { status: 500 });
  }
}
