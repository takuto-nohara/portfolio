import type { OauthError } from "./oauth.service";

/** OAuth のエンドポイント（route.ts）で共通に使う応答と入力の読み取り */

const NO_STORE = { "Cache-Control": "no-store", Pragma: "no-cache" };

/** AI ツールのブラウザ版（MCP Inspector など）からも呼べるよう、トークンを扱わない公開エンドポイントは CORS を許す */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Protocol-Version",
};

export function oauthJson(body: unknown, status = 200, headers: Record<string, string> = NO_STORE): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS, ...headers },
  });
}

export function oauthError(body: OauthError, status = 400): Response {
  return oauthJson(body, status);
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function redirectTo(location: string): Response {
  return new Response(null, { status: 302, headers: { Location: location, ...NO_STORE } });
}

const AUTHORIZE_FIELDS = ["client_id", "redirect_uri", "response_type", "scope", "state", "code_challenge", "code_challenge_method", "resource"] as const;

/** 認可の要求に使う項目だけを取り出す */
export function authorizeParams(params: URLSearchParams | Record<string, string | undefined>): Record<string, string | undefined> {
  const get = (name: string) => (params instanceof URLSearchParams ? (params.get(name) ?? undefined) : params[name]);
  return Object.fromEntries(AUTHORIZE_FIELDS.map((name) => [name, get(name)]));
}

/** 同意画面へ渡すクエリ（認可の要求をそのまま持ち回り、同意のフォームで送り返す） */
export function consentQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();

  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined) {
      query.set(name, value);
    }
  }

  return query.toString();
}

export function withParams(base: string, params: Record<string, string | null>): string {
  const url = new URL(base);

  for (const [name, value] of Object.entries(params)) {
    if (value !== null) {
      url.searchParams.set(name, value);
    }
  }

  return url.toString();
}

/** application/x-www-form-urlencoded（または multipart）の本文。読めなければ空 */
export async function readForm(request: Request): Promise<Record<string, string | undefined>> {
  try {
    const form = await request.formData();
    const values: Record<string, string> = {};

    form.forEach((value, name) => {
      if (typeof value === "string") {
        values[name] = value;
      }
    });

    return values;
  } catch {
    return {};
  }
}
