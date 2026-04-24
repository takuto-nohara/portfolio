import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  GetFeaturedWorksUseCase,
  GetPublicSettingsUseCase,
  GetWorkDetailUseCase,
  GetWorkListUseCase,
  SendContactUseCase,
} from "@/application/publicApi";
import {
  D1ContactRepository,
  D1OAuthTokenRepository,
  D1SettingRepository,
  D1WorkRepository,
  GmailEmailAdapter,
  GoogleOAuthAdapter,
  R2StorageAdapter,
} from "@/infrastructure/publicApi";

function requireBinding<T>(value: T | undefined, name: string): T {
  if (!value) {
    throw new Error(`${name} binding is not configured.`);
  }

  return value;
}

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function parseScopes(value: string | undefined): readonly string[] {
  if (!value) {
    return ["openid", "email", "profile", "https://www.googleapis.com/auth/gmail.send"];
  }

  return value
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0);
}

export async function getAppServices() {
  const { env } = await getCloudflareContext({ async: true });
  const database = requireBinding(env.DB, "DB");
  const bucket = requireBinding(env.R2_BUCKET, "R2_BUCKET");

  const workRepository = new D1WorkRepository(database);
  const contactRepository = new D1ContactRepository(database);
  const settingRepository = new D1SettingRepository(database);
  const oAuthTokenRepository = new D1OAuthTokenRepository(database);
  const oAuthPort = new GoogleOAuthAdapter({
    clientId: requireEnv(env.GOOGLE_OAUTH_CLIENT_ID, "GOOGLE_OAUTH_CLIENT_ID"),
    clientSecret: requireEnv(env.GOOGLE_OAUTH_CLIENT_SECRET, "GOOGLE_OAUTH_CLIENT_SECRET"),
    redirectUri: requireEnv(env.GOOGLE_OAUTH_REDIRECT_URI, "GOOGLE_OAUTH_REDIRECT_URI"),
    scopes: parseScopes(env.GOOGLE_OAUTH_SCOPES),
  });
  const emailPort = new GmailEmailAdapter(
    {
      fromEmail: requireEnv(env.GMAIL_FROM_EMAIL, "GMAIL_FROM_EMAIL"),
      senderName: env.GMAIL_SENDER_NAME,
      subjectPrefix: env.GMAIL_SUBJECT_PREFIX,
    },
    oAuthTokenRepository,
    oAuthPort,
  );
  const storagePort = new R2StorageAdapter(bucket, {
    publicBaseUrl: requireEnv(env.R2_PUBLIC_BASE_URL, "R2_PUBLIC_BASE_URL"),
  });

  return {
    repositories: {
      workRepository,
      contactRepository,
      settingRepository,
      oAuthTokenRepository,
    },
    ports: {
      emailPort,
      oAuthPort,
      storagePort,
    },
    useCases: {
      getFeaturedWorks: new GetFeaturedWorksUseCase(workRepository),
      getPublicSettings: new GetPublicSettingsUseCase(settingRepository),
      getWorkDetail: new GetWorkDetailUseCase(workRepository),
      getWorkList: new GetWorkListUseCase(workRepository),
      sendContact: new SendContactUseCase(contactRepository, emailPort, settingRepository),
    },
  };
}