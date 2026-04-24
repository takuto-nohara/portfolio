import type { OAuthPort } from "@/application/publicApi";
import type { OAuthToken } from "@/domain/publicApi";

interface GoogleTokenResponse {
  readonly access_token: string;
  readonly expires_in?: number;
  readonly refresh_token?: string;
  readonly scope?: string;
  readonly token_type?: string;
  readonly error?: string;
  readonly error_description?: string;
}

interface GoogleUserInfoResponse {
  readonly email?: string;
}

export interface GoogleOAuthConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUri: string;
  readonly scopes: readonly string[];
}

export class GoogleOAuthAdapter implements OAuthPort {
  private readonly scopes: readonly string[];

  constructor(private readonly config: GoogleOAuthConfig) {
    this.scopes = config.scopes.length > 0 ? config.scopes : ["openid", "email", "profile"];
  }

  createAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: this.scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  exchangeCode(code: string): Promise<OAuthToken> {
    return this.requestToken(
      new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.config.redirectUri,
      }),
    );
  }

  refreshAccessToken(refreshToken: string): Promise<OAuthToken> {
    return this.requestToken(
      new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      refreshToken,
    );
  }

  private async requestToken(params: URLSearchParams, fallbackRefreshToken?: string): Promise<OAuthToken> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const payload = (await response.json()) as GoogleTokenResponse;

    if (!response.ok || payload.error) {
      throw new Error(payload.error_description ?? payload.error ?? "Google OAuth token request failed.");
    }

    return {
      provider: "google",
      email: await this.fetchEmail(payload.access_token),
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token ?? fallbackRefreshToken ?? null,
      expiresAt: payload.expires_in ? new Date(Date.now() + payload.expires_in * 1000).toISOString() : null,
      scope: payload.scope ?? this.scopes.join(" "),
      tokenType: payload.token_type ?? "Bearer",
      createdAt: null,
      updatedAt: null,
    };
  }

  private async fetchEmail(accessToken: string): Promise<string | null> {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as GoogleUserInfoResponse;
    return payload.email ?? null;
  }
}