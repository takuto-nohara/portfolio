import type { EmailPort, OAuthPort } from "@/application/publicApi";
import type { Contact, OAuthToken, OAuthTokenRepository } from "@/domain/publicApi";

interface GmailSendResponse {
  readonly id?: string;
  readonly error?: {
    readonly message?: string;
  };
}

export interface GmailEmailConfig {
  readonly fromEmail: string;
  readonly senderName?: string;
  readonly subjectPrefix?: string;
}

export class GmailEmailAdapter implements EmailPort {
  constructor(
    private readonly config: GmailEmailConfig,
    private readonly tokenRepository: OAuthTokenRepository,
    private readonly oAuthPort: OAuthPort,
  ) {}

  async sendContactEmail(contact: Contact, toEmail: string): Promise<void> {
    const accessToken = await this.resolveAccessToken();
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: this.buildRawMessage(contact, toEmail),
      }),
    });

    const payload = (await response.json()) as GmailSendResponse;

    if (!response.ok || !payload.id) {
      throw new Error(payload.error?.message ?? "Failed to send contact email via Gmail API.");
    }
  }

  private async resolveAccessToken(): Promise<string> {
    const token = await this.tokenRepository.findByProvider("google");

    if (!token) {
      throw new Error("Google OAuth token is not configured.");
    }

    if (!this.isExpired(token)) {
      return token.accessToken;
    }

    if (!token.refreshToken) {
      throw new Error("Google OAuth refresh token is missing.");
    }

    const refreshedToken = await this.oAuthPort.refreshAccessToken(token.refreshToken);
    const savedToken = await this.tokenRepository.save({
      ...refreshedToken,
      provider: "google",
      email: refreshedToken.email ?? token.email,
      refreshToken: refreshedToken.refreshToken ?? token.refreshToken,
    });

    return savedToken.accessToken;
  }

  private isExpired(token: OAuthToken): boolean {
    if (!token.expiresAt) {
      return false;
    }

    return new Date(token.expiresAt).getTime() <= Date.now() + 60_000;
  }

  private buildRawMessage(contact: Contact, toEmail: string): string {
    const subjectPrefix = this.config.subjectPrefix ? `${this.config.subjectPrefix} ` : "";
    const fromHeader = this.config.senderName
      ? `"${this.escapeHeader(this.config.senderName)}" <${this.config.fromEmail}>`
      : this.config.fromEmail;
    const subject = `${subjectPrefix}ポートフォリオサイトからのお問い合わせ`;
    const body = [
      `名前: ${contact.name}`,
      `メールアドレス: ${contact.email}`,
      "",
      "本文:",
      contact.message,
    ].join("\r\n");

    const message = [
      `From: ${fromHeader}`,
      `To: ${toEmail}`,
      `Reply-To: ${contact.email}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
      `Subject: ${subject}`,
      "",
      body,
    ].join("\r\n");

    return this.encodeBase64Url(message);
  }

  private escapeHeader(value: string): string {
    return value.replace(/"/g, "'");
  }

  private encodeBase64Url(value: string): string {
    const bytes = new TextEncoder().encode(value);
    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
}