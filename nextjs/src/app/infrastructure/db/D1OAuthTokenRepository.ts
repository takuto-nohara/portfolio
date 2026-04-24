import type { OAuthToken, OAuthTokenRepository } from "@/domain/publicApi";

import { D1DatabaseLike } from "./D1Database";
import { mapOAuthTokenRow, OAuthTokenRow } from "./mappers";

export class D1OAuthTokenRepository implements OAuthTokenRepository {
  constructor(private readonly database: D1DatabaseLike) {}

  async findByProvider(provider: OAuthToken["provider"]): Promise<OAuthToken | null> {
    const row = await this.database
      .prepare(
        `SELECT provider, email, access_token, refresh_token, expires_at, scope, token_type, created_at, updated_at
         FROM oauth_tokens
         WHERE provider = ?`,
      )
      .bind(provider)
      .first<OAuthTokenRow>();

    return row ? mapOAuthTokenRow(row) : null;
  }

  async save(token: OAuthToken): Promise<OAuthToken> {
    await this.database
      .prepare(
        `INSERT INTO oauth_tokens (
           provider, email, access_token, refresh_token, expires_at, scope, token_type, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(provider) DO UPDATE SET
           email = excluded.email,
           access_token = excluded.access_token,
           refresh_token = excluded.refresh_token,
           expires_at = excluded.expires_at,
           scope = excluded.scope,
           token_type = excluded.token_type,
           updated_at = CURRENT_TIMESTAMP`,
      )
      .bind(
        token.provider,
        token.email,
        token.accessToken,
        token.refreshToken,
        token.expiresAt,
        token.scope,
        token.tokenType,
      )
      .run();

    const saved = await this.findByProvider(token.provider);

    if (!saved) {
      throw new Error(`OAuth token for provider ${token.provider} could not be reloaded after save.`);
    }

    return saved;
  }

  deleteByProvider(provider: OAuthToken["provider"]): Promise<void> {
    return this.database.prepare("DELETE FROM oauth_tokens WHERE provider = ?").bind(provider).run().then(() => undefined);
  }
}