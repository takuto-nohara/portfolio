export interface OAuthToken {
  readonly provider: "google";
  readonly email: string | null;
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly expiresAt: string | null;
  readonly scope: string | null;
  readonly tokenType: string | null;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}