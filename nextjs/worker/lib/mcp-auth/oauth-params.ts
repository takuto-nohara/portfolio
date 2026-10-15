import { API_SCOPES, type ApiScope } from "./types";

/** OAuth の要求に含まれる値の検査（redirect_uri・client_id の URL・scope・クライアント名） */

const MAX_REDIRECT_URIS = 10;
const MAX_CLIENT_NAME = 100;

export const SCOPE_DESCRIPTIONS: Readonly<Record<ApiScope, string>> = {
  "portfolio:read": "作品・制作区分・お問い合わせ・サイト設定の閲覧",
  "portfolio:write": "作品・ギャラリー画像・制作区分・サイト設定の登録・更新・削除、お問い合わせの削除",
};

/** client_id として受ける URL（Client ID Metadata Document）。https で、認証情報やフラグメントの無いもの */
export function isMetadataClientId(clientId: string): boolean {
  try {
    const url = new URL(clientId);
    return url.protocol === "https:" && url.username === "" && url.password === "" && url.hash === "" && clientId.length <= 512;
  } catch {
    return false;
  }
}

/** redirect_uri は https か、ループバック（localhost / 127.0.0.1 / [::1]）の http。フラグメントは不可 */
function isRedirectUri(value: unknown): boolean {
  if (typeof value !== "string" || value.length > 2048) {
    return false;
  }

  try {
    const url = new URL(value);

    if (url.hash !== "" || url.username !== "" || url.password !== "") {
      return false;
    }

    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname));
  } catch {
    return false;
  }
}

export function parseRedirectUris(input: unknown): string[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_REDIRECT_URIS || !input.every(isRedirectUri)) {
    return null;
  }

  return [...new Set(input as string[])];
}

export function clientNameOf(input: unknown, placeholder: string): string {
  const name = typeof input === "string" ? input.trim().slice(0, MAX_CLIENT_NAME) : "";
  return name === "" ? placeholder : name;
}

/** 省略なら両方。指定があれば知っているスコープだけで、知らないものが混ざれば不正 */
export function parseScope(input: string | undefined): string | null {
  if (input === undefined || input.trim() === "") {
    return API_SCOPES.join(" ");
  }

  const scopes = [...new Set(input.split(/\s+/u).filter((scope) => scope !== ""))];
  return scopes.every((scope) => (API_SCOPES as readonly string[]).includes(scope)) ? scopes.join(" ") : null;
}

/** リフレッシュのときの scope は、元の範囲の中でだけ狭められる */
export function narrowScope(requested: string, granted: string): string | null {
  const scope = parseScope(requested);

  if (scope === null) {
    return null;
  }

  const allowed = new Set(granted.split(" "));
  return scope.split(" ").every((item) => allowed.has(item)) ? scope : null;
}
