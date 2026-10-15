import type { D1DatabaseLike } from "@/infrastructure/publicApi";

import type { ApiToken, ApiTokenRepository } from "./types";

interface ApiTokenRow {
  readonly id: string;
  readonly user_id: number;
  readonly kind: string;
  readonly label: string;
  readonly prefix: string;
  readonly client_id: string | null;
  readonly scope: string;
  readonly audience: string | null;
  readonly created_at: string;
  readonly last_used_at: string | null;
  readonly expires_at: string | null;
}

const columns = "id, user_id, kind, label, prefix, client_id, scope, audience, created_at, last_used_at, expires_at";

function toToken(row: ApiTokenRow): ApiToken {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind === "oauth" ? "oauth" : "personal",
    label: row.label,
    prefix: row.prefix,
    clientId: row.client_id,
    scope: row.scope,
    audience: row.audience,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
    expiresAt: row.expires_at,
  };
}

function toValues(token: ApiToken): readonly unknown[] {
  return [
    token.id,
    token.userId,
    token.kind,
    token.label,
    token.prefix,
    token.clientId,
    token.scope,
    token.audience,
    token.createdAt,
    token.lastUsedAt,
    token.expiresAt,
  ];
}

export class D1ApiTokenRepository implements ApiTokenRepository {
  constructor(private readonly database: D1DatabaseLike) {}

  async save(token: ApiToken): Promise<void> {
    await this.database
      .prepare(`INSERT INTO api_tokens (${columns}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(...toValues(token))
      .run();
  }

  async saveIfBelow(token: ApiToken, limit: number): Promise<boolean> {
    // 数えるのと入れるのを 1 文で行い、同時の発行で上限を越えないようにする
    await this.database
      .prepare(
        `INSERT INTO api_tokens (${columns})
         SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
         WHERE (SELECT COUNT(*) FROM api_tokens WHERE user_id = ? AND kind = ?) < ?
         ON CONFLICT(id) DO NOTHING`,
      )
      .bind(...toValues(token), token.userId, token.kind, limit)
      .run();

    return (await this.find(token.id)) !== null;
  }

  async find(id: string): Promise<ApiToken | null> {
    const row = await this.database.prepare(`SELECT ${columns} FROM api_tokens WHERE id = ?`).bind(id).first<ApiTokenRow>();
    return row ? toToken(row) : null;
  }

  async list(userId: number): Promise<ApiToken[]> {
    const result = await this.database
      .prepare(`SELECT ${columns} FROM api_tokens WHERE user_id = ? ORDER BY created_at ASC`)
      .bind(userId)
      .all<ApiTokenRow>();
    return (result.results ?? []).map(toToken);
  }

  async delete(userId: number, id: string): Promise<boolean> {
    const row = await this.database
      .prepare("DELETE FROM api_tokens WHERE id = ? AND user_id = ? RETURNING id")
      .bind(id, userId)
      .first<{ id: string }>();
    return row !== null;
  }

  async touch(id: string, lastUsedAt: string): Promise<void> {
    await this.database.prepare("UPDATE api_tokens SET last_used_at = ? WHERE id = ?").bind(lastUsedAt, id).run();
  }

  async deleteExpired(now: string): Promise<void> {
    await this.database.prepare("DELETE FROM api_tokens WHERE expires_at IS NOT NULL AND expires_at < ?").bind(now).run();
  }
}
