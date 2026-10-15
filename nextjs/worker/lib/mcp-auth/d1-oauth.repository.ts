import type { D1DatabaseLike } from "@/infrastructure/publicApi";

import type {
  OauthClient,
  OauthClientRepository,
  OauthCode,
  OauthCodeRepository,
  OauthRefreshToken,
  OauthRefreshTokenRepository,
} from "./oauth.types";

interface ClientRow {
  readonly client_id: string;
  readonly client_name: string;
  readonly redirect_uris_json: string;
  readonly source: string;
  readonly fetched_at: string;
}

interface CodeRow {
  readonly id: string;
  readonly client_id: string;
  readonly user_id: number;
  readonly redirect_uri: string;
  readonly code_challenge: string;
  readonly scope: string;
  readonly audience: string | null;
  readonly expires_at: string;
}

interface RefreshRow {
  readonly id: string;
  readonly user_id: number;
  readonly client_id: string;
  readonly family_id: string;
  readonly scope: string;
  readonly audience: string | null;
  readonly access_token_id: string;
  readonly expires_at: string;
  readonly used_at: string | null;
}

function toClient(row: ClientRow): OauthClient {
  return {
    clientId: row.client_id,
    clientName: row.client_name,
    redirectUris: JSON.parse(row.redirect_uris_json) as string[],
    source: row.source === "metadata" ? "metadata" : "registered",
    fetchedAt: row.fetched_at,
  };
}

function toRefresh(row: RefreshRow): OauthRefreshToken {
  return {
    id: row.id,
    userId: row.user_id,
    clientId: row.client_id,
    familyId: row.family_id,
    scope: row.scope,
    audience: row.audience,
    accessTokenId: row.access_token_id,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
  };
}

async function all<T>(database: D1DatabaseLike, query: string, ...values: unknown[]): Promise<T[]> {
  return (await database.prepare(query).bind(...values).all<T>()).results ?? [];
}

export class D1OauthClientRepository implements OauthClientRepository {
  constructor(private readonly database: D1DatabaseLike) {}

  async save(client: OauthClient): Promise<void> {
    await this.database
      .prepare(
        `INSERT INTO oauth_clients (client_id, client_name, redirect_uris_json, source, fetched_at) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(client_id) DO UPDATE SET client_name = excluded.client_name, redirect_uris_json = excluded.redirect_uris_json,
           source = excluded.source, fetched_at = excluded.fetched_at`,
      )
      .bind(client.clientId, client.clientName, JSON.stringify(client.redirectUris), client.source, client.fetchedAt)
      .run();
  }

  async saveIfBelow(client: OauthClient, limit: number): Promise<boolean> {
    await this.database
      .prepare(
        `INSERT INTO oauth_clients (client_id, client_name, redirect_uris_json, source, fetched_at)
         SELECT ?, ?, ?, ?, ?
         WHERE (SELECT COUNT(*) FROM oauth_clients WHERE source = ?) < ?
         ON CONFLICT(client_id) DO NOTHING`,
      )
      .bind(client.clientId, client.clientName, JSON.stringify(client.redirectUris), client.source, client.fetchedAt, client.source, limit)
      .run();

    return (await this.find(client.clientId)) !== null;
  }

  async find(clientId: string): Promise<OauthClient | null> {
    const row = await this.database.prepare("SELECT * FROM oauth_clients WHERE client_id = ?").bind(clientId).first<ClientRow>();
    return row ? toClient(row) : null;
  }

  async deleteUnusedBefore(source: OauthClient["source"], before: string, now: string): Promise<void> {
    // 1 文で消す（読んだあとに認可が始まった行を消すことはない）
    await this.database
      .prepare(
        `DELETE FROM oauth_clients
         WHERE source = ? AND fetched_at < ?
           AND client_id NOT IN (SELECT client_id FROM oauth_refresh_tokens WHERE expires_at > ?)
           AND client_id NOT IN (SELECT client_id FROM oauth_codes WHERE expires_at > ?)`,
      )
      .bind(source, before, now, now)
      .run();
  }
}

export class D1OauthCodeRepository implements OauthCodeRepository {
  constructor(private readonly database: D1DatabaseLike) {}

  async save(code: OauthCode): Promise<void> {
    await this.database
      .prepare(
        `INSERT INTO oauth_codes (id, client_id, user_id, redirect_uri, code_challenge, scope, audience, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(code.id, code.clientId, code.userId, code.redirectUri, code.codeChallenge, code.scope, code.audience, code.expiresAt)
      .run();
  }

  async consume(id: string): Promise<OauthCode | null> {
    const row = await this.database.prepare("DELETE FROM oauth_codes WHERE id = ? RETURNING *").bind(id).first<CodeRow>();

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      clientId: row.client_id,
      userId: row.user_id,
      redirectUri: row.redirect_uri,
      codeChallenge: row.code_challenge,
      scope: row.scope,
      audience: row.audience,
      expiresAt: row.expires_at,
    };
  }

  async deleteExpired(now: string): Promise<void> {
    await this.database.prepare("DELETE FROM oauth_codes WHERE expires_at < ?").bind(now).run();
  }
}

export class D1OauthRefreshTokenRepository implements OauthRefreshTokenRepository {
  constructor(private readonly database: D1DatabaseLike) {}

  async save(token: OauthRefreshToken): Promise<void> {
    await this.database
      .prepare(
        `INSERT INTO oauth_refresh_tokens (id, user_id, client_id, family_id, scope, audience, access_token_id, expires_at, used_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(token.id, token.userId, token.clientId, token.familyId, token.scope, token.audience, token.accessTokenId, token.expiresAt, token.usedAt)
      .run();
  }

  async find(id: string): Promise<OauthRefreshToken | null> {
    const row = await this.database.prepare("SELECT * FROM oauth_refresh_tokens WHERE id = ?").bind(id).first<RefreshRow>();
    return row ? toRefresh(row) : null;
  }

  async markUsed(id: string, usedAt: string): Promise<boolean> {
    // used_at が NULL の行だけを更新する（同時に 2 つの要求が来ても、使えるのは 1 つだけ）
    const row = await this.database
      .prepare("UPDATE oauth_refresh_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL RETURNING id")
      .bind(usedAt, id)
      .first<{ id: string }>();
    return row !== null;
  }

  async findByAccessTokenId(accessTokenId: string): Promise<OauthRefreshToken | null> {
    const row = await this.database.prepare("SELECT * FROM oauth_refresh_tokens WHERE access_token_id = ?").bind(accessTokenId).first<RefreshRow>();
    return row ? toRefresh(row) : null;
  }

  async listLiveAccessTokenIds(userId: number, now: string): Promise<string[]> {
    const rows = await all<{ access_token_id: string }>(
      this.database,
      "SELECT access_token_id FROM oauth_refresh_tokens WHERE user_id = ? AND used_at IS NULL AND expires_at > ?",
      userId,
      now,
    );
    return rows.map((row) => row.access_token_id);
  }

  async deleteFamily(familyId: string): Promise<string[]> {
    const rows = await all<{ access_token_id: string }>(this.database, "DELETE FROM oauth_refresh_tokens WHERE family_id = ? RETURNING access_token_id", familyId);
    return rows.map((row) => row.access_token_id);
  }

  async deleteExpired(now: string): Promise<void> {
    await this.database.prepare("DELETE FROM oauth_refresh_tokens WHERE expires_at < ?").bind(now).run();
    // family の無くなった OAuth のアクセストークンもまとめて消す（組は常にリフレッシュトークンを先に入れるので、作成中の組は残る）
    await this.database
      .prepare("DELETE FROM api_tokens WHERE kind = 'oauth' AND id NOT IN (SELECT access_token_id FROM oauth_refresh_tokens)")
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.database.prepare("DELETE FROM oauth_refresh_tokens WHERE id = ?").bind(id).run();
  }
}
