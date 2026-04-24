import type { OAuthToken } from "@/domain/publicApi";

export interface OAuthPort {
  createAuthorizationUrl(state: string): string;
  exchangeCode(code: string): Promise<OAuthToken>;
  refreshAccessToken(refreshToken: string): Promise<OAuthToken>;
}