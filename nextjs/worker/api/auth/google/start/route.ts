import { NextRequest, NextResponse } from "next/server";

import { internalServerError } from "@worker/lib/api/responses";
import { getAppServices } from "@worker/lib/api/services";

const STATE_COOKIE_NAME = "google_oauth_state";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const redirectUri = new URL("/api/auth/google/callback", request.url).toString();
    const services = await getAppServices(redirectUri);
    const state = crypto.randomUUID();
    const authorizationUrl = services.ports.oAuthPort.createAuthorizationUrl(state);
    const response = NextResponse.redirect(authorizationUrl);

    response.cookies.set({
      name: STATE_COOKIE_NAME,
      value: state,
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    return internalServerError(error, "Failed to start Google OAuth flow.");
  }
}