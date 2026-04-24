import { NextRequest, NextResponse } from "next/server";

import { badRequest, internalServerError } from "@/lib/api/responses";
import { getAppServices } from "@/lib/api/services";

const STATE_COOKIE_NAME = "google_oauth_state";

function createRedirectResponse(request: NextRequest, status: "success" | "error"): NextResponse {
  const url = new URL("/", request.url);
  url.searchParams.set("google_oauth", status);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const state = request.nextUrl.searchParams.get("state");
    const code = request.nextUrl.searchParams.get("code");
    const savedState = request.cookies.get(STATE_COOKIE_NAME)?.value;

    if (!state || !code) {
      return badRequest("Google OAuth callback is missing required parameters.");
    }

    if (!savedState || savedState !== state) {
      return badRequest("Google OAuth state validation failed.");
    }

    const services = await getAppServices();
    const token = await services.ports.oAuthPort.exchangeCode(code);

    await services.repositories.oAuthTokenRepository.save(token);

    const response = createRedirectResponse(request, "success");
    response.cookies.delete(STATE_COOKIE_NAME);

    return response;
  } catch (error) {
    return internalServerError(error, "Failed to complete Google OAuth flow.");
  }
}