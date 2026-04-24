import type { OAuthToken } from "../entities/OAuthToken";

export interface OAuthTokenRepository {
  findByProvider(provider: OAuthToken["provider"]): Promise<OAuthToken | null>;
  save(token: OAuthToken): Promise<OAuthToken>;
  deleteByProvider(provider: OAuthToken["provider"]): Promise<void>;
}