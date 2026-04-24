import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE_NAME, type AdminSession, verifyAdminSessionToken } from "./session";

function buildLoginUrl(redirectTo: string): string {
  return `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
}

export async function getCurrentAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
}

export async function getAdminSessionFromRequest(request: NextRequest): Promise<AdminSession | null> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
}

export async function requireAdminPageSession(redirectTo: string): Promise<AdminSession> {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect(buildLoginUrl(redirectTo));
  }

  return session;
}