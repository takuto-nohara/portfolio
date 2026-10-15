import { base64UrlEncode } from "./crypto";

/**
 * PKCE（RFC 7636）。公開クライアント（AI ツール）が認可コードを横取りされても使えないようにする。
 * code_challenge = base64url(SHA-256(code_verifier))。S256 だけを受ける。
 */

const VERIFIER_PATTERN = /^[A-Za-z0-9._~-]{43,128}$/u;
const CHALLENGE_PATTERN = /^[A-Za-z0-9_-]{43}$/u;

function isCodeVerifier(value: unknown): value is string {
  return typeof value === "string" && VERIFIER_PATTERN.test(value);
}

export function isCodeChallenge(value: unknown): value is string {
  return typeof value === "string" && CHALLENGE_PATTERN.test(value);
}

async function pkceChallenge(verifier: string): Promise<string> {
  return base64UrlEncode(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
}

export async function verifyPkce(verifier: unknown, challenge: string): Promise<boolean> {
  return isCodeVerifier(verifier) && (await pkceChallenge(verifier)) === challenge;
}
