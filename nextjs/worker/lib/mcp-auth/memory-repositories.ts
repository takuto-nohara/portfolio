import type { OauthClient, OauthClientRepository, OauthCode, OauthCodeRepository, OauthRefreshToken, OauthRefreshTokenRepository } from "./oauth.types";
import type { ApiToken, ApiTokenRepository } from "./types";

/** テスト用のメモリ上のリポジトリ（D1 の実装と同じ約束を守る） */

export class MemoryApiTokenRepository implements ApiTokenRepository {
  readonly rows = new Map<string, ApiToken>();

  async save(token: ApiToken): Promise<void> {
    this.rows.set(token.id, token);
  }

  async saveIfBelow(token: ApiToken, limit: number): Promise<boolean> {
    const count = [...this.rows.values()].filter((row) => row.userId === token.userId && row.kind === token.kind).length;

    if (count >= limit) {
      return false;
    }

    this.rows.set(token.id, token);
    return true;
  }

  async find(id: string): Promise<ApiToken | null> {
    return this.rows.get(id) ?? null;
  }

  async list(userId: number): Promise<ApiToken[]> {
    return [...this.rows.values()].filter((row) => row.userId === userId);
  }

  async delete(userId: number, id: string): Promise<boolean> {
    const row = this.rows.get(id);
    return row?.userId === userId ? this.rows.delete(id) : false;
  }

  async touch(id: string, lastUsedAt: string): Promise<void> {
    const row = this.rows.get(id);
    if (row) this.rows.set(id, { ...row, lastUsedAt });
  }

  async deleteExpired(now: string): Promise<void> {
    for (const [id, row] of this.rows) {
      if (row.expiresAt !== null && row.expiresAt < now) this.rows.delete(id);
    }
  }
}

export class MemoryOauthClientRepository implements OauthClientRepository {
  readonly rows = new Map<string, OauthClient>();

  async save(client: OauthClient): Promise<void> {
    this.rows.set(client.clientId, client);
  }

  async saveIfBelow(client: OauthClient, limit: number): Promise<boolean> {
    if ([...this.rows.values()].filter((row) => row.source === client.source).length >= limit) {
      return false;
    }

    this.rows.set(client.clientId, client);
    return true;
  }

  async find(clientId: string): Promise<OauthClient | null> {
    return this.rows.get(clientId) ?? null;
  }

  async deleteUnusedBefore(): Promise<void> {}
}

export class MemoryOauthCodeRepository implements OauthCodeRepository {
  readonly rows = new Map<string, OauthCode>();

  async save(code: OauthCode): Promise<void> {
    this.rows.set(code.id, code);
  }

  async consume(id: string): Promise<OauthCode | null> {
    const row = this.rows.get(id) ?? null;
    this.rows.delete(id);
    return row;
  }

  async deleteExpired(now: string): Promise<void> {
    for (const [id, row] of this.rows) {
      if (row.expiresAt < now) this.rows.delete(id);
    }
  }
}

export class MemoryOauthRefreshTokenRepository implements OauthRefreshTokenRepository {
  readonly rows = new Map<string, OauthRefreshToken>();

  constructor(private readonly tokens: MemoryApiTokenRepository) {}

  async save(token: OauthRefreshToken): Promise<void> {
    this.rows.set(token.id, token);
  }

  async find(id: string): Promise<OauthRefreshToken | null> {
    return this.rows.get(id) ?? null;
  }

  async markUsed(id: string, usedAt: string): Promise<boolean> {
    const row = this.rows.get(id);

    if (!row || row.usedAt !== null) {
      return false;
    }

    this.rows.set(id, { ...row, usedAt });
    return true;
  }

  async findByAccessTokenId(accessTokenId: string): Promise<OauthRefreshToken | null> {
    return [...this.rows.values()].find((row) => row.accessTokenId === accessTokenId) ?? null;
  }

  async listLiveAccessTokenIds(userId: number, now: string): Promise<string[]> {
    return [...this.rows.values()].filter((row) => row.userId === userId && row.usedAt === null && row.expiresAt > now).map((row) => row.accessTokenId);
  }

  async deleteFamily(familyId: string): Promise<string[]> {
    const removed = [...this.rows.values()].filter((row) => row.familyId === familyId);
    removed.forEach((row) => this.rows.delete(row.id));
    return removed.map((row) => row.accessTokenId);
  }

  async deleteExpired(now: string): Promise<void> {
    for (const [id, row] of this.rows) {
      if (row.expiresAt < now) this.rows.delete(id);
    }

    const live = new Set([...this.rows.values()].map((row) => row.accessTokenId));

    for (const [id, row] of this.tokens.rows) {
      if (row.kind === "oauth" && !live.has(id)) this.tokens.rows.delete(id);
    }
  }

  async delete(id: string): Promise<void> {
    this.rows.delete(id);
  }
}
