/**
 * OAuth 2.1（このサイト自身が認可サーバー兼リソースサーバー）の保存。
 * ChatGPT や Claude のコネクタのように固定のトークンを渡せない AI ツールが、同意画面を通して MCP のアクセストークンを得るために使う。
 */

/** 登録済みのクライアント。registered は POST /api/oauth/register で作ったもの、metadata は client_id の URL から取った文書（24 時間の写し） */
export interface OauthClient {
  readonly clientId: string;
  readonly clientName: string;
  readonly redirectUris: readonly string[];
  readonly source: "registered" | "metadata";
  readonly fetchedAt: string;
}

export interface OauthClientRepository {
  /** clientId が同じなら置き換える */
  save(client: OauthClient): Promise<void>;
  /** 同じ source の件数が limit 未満のときだけ新しく保存する（数えるのと入れるのを 1 文で）。保存できたら true */
  saveIfBelow(client: OauthClient, limit: number): Promise<boolean>;
  find(clientId: string): Promise<OauthClient | null>;
  /** before より前に登録・取得し、生きている認可（期限内のリフレッシュトークン・交換待ちの認可コード）が無いものを消す */
  deleteUnusedBefore(source: OauthClient["source"], before: string, now: string): Promise<void>;
}

/** 認可コード。id はコードの SHA-256。10 分・1 回限り */
export interface OauthCode {
  readonly id: string;
  readonly clientId: string;
  readonly userId: number;
  readonly redirectUri: string;
  /** PKCE（S256）の code_challenge */
  readonly codeChallenge: string;
  readonly scope: string;
  /** resource（このコードで得るトークンを使える MCP エンドポイント）。指定が無ければ null */
  readonly audience: string | null;
  readonly expiresAt: string;
}

export interface OauthCodeRepository {
  save(code: OauthCode): Promise<void>;
  /** 消さずに読む（交換の前の検査用） */
  find(id: string): Promise<OauthCode | null>;
  /** 取り出して消す（1 回限り）。無ければ null */
  consume(id: string): Promise<OauthCode | null>;
  deleteExpired(now: string): Promise<void>;
}

/**
 * リフレッシュトークン。id はトークンの SHA-256。使うたびに新しいものに替え（回転）、使い終えたものは used_at を付けて残す。
 * 使い終えたものがもう一度使われたら盗まれたとみなし、同じ family をすべて失効する
 */
export interface OauthRefreshToken {
  readonly id: string;
  readonly userId: number;
  readonly clientId: string;
  readonly familyId: string;
  readonly scope: string;
  readonly audience: string | null;
  /** 対になるアクセストークン（api_tokens.id） */
  readonly accessTokenId: string;
  readonly expiresAt: string;
  readonly usedAt: string | null;
}

export interface OauthRefreshTokenRepository {
  save(token: OauthRefreshToken): Promise<void>;
  find(id: string): Promise<OauthRefreshToken | null>;
  /** まだ使っていなければ使用済みにして true。すでに使用済み（同時の要求を含む）なら false */
  markUsed(id: string, usedAt: string): Promise<boolean>;
  findByAccessTokenId(accessTokenId: string): Promise<OauthRefreshToken | null>;
  /** 本人の生きている（未使用で期限内の）リフレッシュトークンと対になるアクセストークンの id */
  listLiveAccessTokenIds(userId: number, now: string): Promise<string[]>;
  /** family のトークンをすべて消す。消した分のアクセストークンの id を返す */
  deleteFamily(familyId: string): Promise<string[]>;
  /** 期限の切れたリフレッシュトークンと、family の無くなった OAuth のアクセストークンを消す */
  deleteExpired(now: string): Promise<void>;
  delete(id: string): Promise<void>;
}
