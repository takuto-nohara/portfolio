/** ログイン後に戻してよい場所（管理画面と、MCP の OAuth 同意画面）。外部や // で始まる URL は受けない */
export function isSafeRedirectTarget(value: unknown): value is string {
  return typeof value === "string" && !value.startsWith("//") && (value.startsWith("/admin") || value.startsWith("/oauth/consent?"));
}
