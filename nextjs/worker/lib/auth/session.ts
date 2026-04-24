import { getCloudflareContext } from "@opennextjs/cloudflare";
import { jwtVerify, SignJWT } from "jose";

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";

export interface AdminSession {
  readonly userId: number;
  readonly name: string;
  readonly email: string;
}

interface AuthRuntimeConfig {
  readonly adminEmails: readonly string[];
  readonly secret: Uint8Array;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseAdminEmails(value: string | undefined): readonly string[] {
  const source = value && value.trim().length > 0 ? value : "admin@example.com";

  return source
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter((email) => email.length > 0);
}

async function getAuthRuntimeConfig(): Promise<AuthRuntimeConfig> {
  const { env } = await getCloudflareContext({ async: true });
  const secretValue =
    env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_SESSION_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : "dev-only-admin-session-secret");

  if (!secretValue) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }

  return {
    adminEmails: parseAdminEmails(env.ADMIN_EMAILS ?? process.env.ADMIN_EMAILS),
    secret: new TextEncoder().encode(secretValue),
  };
}

export async function isAdminEmail(email: string): Promise<boolean> {
  const config = await getAuthRuntimeConfig();
  return config.adminEmails.includes(normalizeEmail(email));
}

export async function createAdminSessionToken(session: AdminSession, remember: boolean): Promise<string> {
  const config = await getAuthRuntimeConfig();

  return new SignJWT({
    userId: session.userId,
    name: session.name,
    email: normalizeEmail(session.email),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(remember ? "30d" : "1d")
    .sign(config.secret);
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSession | null> {
  try {
    const config = await getAuthRuntimeConfig();
    const { payload } = await jwtVerify(token, config.secret);

    if (
      typeof payload.userId !== "number" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    if (!config.adminEmails.includes(normalizeEmail(payload.email))) {
      return null;
    }

    return {
      userId: payload.userId,
      name: payload.name,
      email: normalizeEmail(payload.email),
    };
  } catch {
    return null;
  }
}

export function getAdminSessionMaxAge(remember: boolean): number {
  return remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
}