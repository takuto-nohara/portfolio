import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: Request): Promise<NextResponse> {
  const redirectTo = new URL("/", request.url);
  const response = NextResponse.redirect(redirectTo);

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: 0,
  });

  return response;
}