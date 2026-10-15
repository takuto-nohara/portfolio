/** トークンで許す操作の範囲。read は参照、write は作品・設定などの登録・更新・削除 */
export type ApiScope = "portfolio:read" | "portfolio:write";

export const API_SCOPES: readonly ApiScope[] = ["portfolio:read", "portfolio:write"];

/**
 * AI ツール向けのアクセストークン。id はトークンの SHA-256。
 * personal は管理画面で発行したもの（期限なし・全スコープ）、oauth は OAuth 2.1 で発行したもの。
 */
export interface ApiToken {
  readonly id: string;
  readonly userId: number;
  readonly kind: "personal" | "oauth";
  readonly label: string;
  /** 画面で見分けるための先頭（ptf_ + 4 文字） */
  readonly prefix: string;
  readonly clientId: string | null;
  /** 空白区切りのスコープ */
  readonly scope: string;
  /** OAuth の resource（このトークンを使える MCP エンドポイント）。personal では null */
  readonly audience: string | null;
  readonly createdAt: string;
  readonly lastUsedAt: string | null;
  /** null なら期限なし */
  readonly expiresAt: string | null;
}

export interface ApiTokenRepository {
  save(token: ApiToken): Promise<void>;
  /** 同じ利用者・同じ kind のトークンが limit 未満のときだけ保存する。保存できたら true */
  saveIfBelow(token: ApiToken, limit: number): Promise<boolean>;
  find(id: string): Promise<ApiToken | null>;
  list(userId: number): Promise<ApiToken[]>;
  /** 本人のトークンだけ消す。消したら true */
  delete(userId: number, id: string): Promise<boolean>;
  touch(id: string, lastUsedAt: string): Promise<void>;
  deleteExpired(now: string): Promise<void>;
}

/** MCP を使える利用者（管理者） */
export interface McpUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}

export interface McpUserLookup {
  /** 管理者として有効な利用者だけ返す（ADMIN_EMAILS から外れた利用者は null） */
  findAdmin(userId: number): Promise<McpUser | null>;
}
