import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  ContextCategoryAdminService,
  DeleteContactUseCase,
  GetFeaturedWorksUseCase,
  GetContactListUseCase,
  GetPublicSettingsUseCase,
  GetWorkDetailUseCase,
  GetWorkListUseCase,
  GetWorkContextCategoryListUseCase,
  SendContactUseCase,
  SettingsAdminService,
  WorkAdminService,
} from "@/application/publicApi";
import {
  D1ContactRepository,
  D1OAuthTokenRepository,
  D1SettingRepository,
  D1WorkContextCategoryRepository,
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

async function getBaseServices() {
  const { env } = await getCloudflareContext({ async: true });
  const database = requireBinding(env.DB, "DB");
  const bucket = requireBinding(env.R2_BUCKET, "R2_BUCKET");

  const workRepository = new D1WorkRepository(database);
  const workContextCategoryRepository = new D1WorkContextCategoryRepository(database);
  const contactRepository = new D1ContactRepository(database);
  const settingRepository = new D1SettingRepository(database);
  const oAuthTokenRepository = new D1OAuthTokenRepository(database);
  const storagePort = new R2StorageAdapter(bucket, {
    publicBaseUrl: env.R2_PUBLIC_BASE_URL ?? "/api/assets",
  });

  return {
    env,
    repositories: {
      workRepository,
      workContextCategoryRepository,
      contactRepository,
      settingRepository,
      oAuthTokenRepository,
    },
    ports: {
      storagePort,
    },
    useCases: {
      deleteContact: new DeleteContactUseCase(contactRepository),
      getContactList: new GetContactListUseCase(contactRepository),
      getFeaturedWorks: new GetFeaturedWorksUseCase(workRepository),
      getPublicSettings: new GetPublicSettingsUseCase(settingRepository),
      getWorkDetail: new GetWorkDetailUseCase(workRepository),
      getWorkList: new GetWorkListUseCase(workRepository),
      getWorkContextCategoryList: new GetWorkContextCategoryListUseCase(workContextCategoryRepository),
    },
    admin: {
      works: new WorkAdminService(workRepository, workContextCategoryRepository, storagePort),
      contextCategories: new ContextCategoryAdminService(workContextCategoryRepository),
      settings: new SettingsAdminService(settingRepository, oAuthTokenRepository),
    },
  };
}

/**
 * OAuth / Gmail を含まないサービス群。
 * 公開ページの読み取りはこちらを使い、Google OAuth の環境変数が未設定でも表示できるようにする。
 */
export async function getReadServices() {
  const baseServices = await getBaseServices();

  return {
    repositories: baseServices.repositories,
    ports: baseServices.ports,
    useCases: baseServices.useCases,
  };
}

/** 管理画面・MCP 向け。読み取り用のサービスに管理操作（admin）を加えたもの。 */
export async function getAdminServices() {
  const baseServices = await getBaseServices();

  return {
    repositories: baseServices.repositories,
    ports: baseServices.ports,
    useCases: baseServices.useCases,
    admin: baseServices.admin,
  };
}

export async function getAppServices(redirectUri?: string) {
  const baseServices = await getBaseServices();
  const { env } = await getCloudflareContext({ async: true });

  // Gmail 設定は管理者画面から DB に保存されたものを使用する
  const { settingRepository } = baseServices.repositories;
  const [gmailFromEmail, gmailSenderName, gmailSubjectPrefix] = await Promise.all([
    settingRepository.findByKey("gmail_from_email"),
    settingRepository.findByKey("gmail_sender_name"),
    settingRepository.findByKey("gmail_subject_prefix"),
  ]);

  const oAuthPort = new GoogleOAuthAdapter({
    clientId: requireEnv(env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID"),
    clientSecret: requireEnv(env.GOOGLE_CLIENT_SECRET, "GOOGLE_CLIENT_SECRET"),
    // redirectUri は OAuth フロー開始時にリクエスト URL から動的に決定する
    redirectUri: redirectUri ?? "",
    scopes: parseScopes(env.GOOGLE_OAUTH_SCOPES),
  });
  const emailPort = new GmailEmailAdapter(
    {
      fromEmail: gmailFromEmail?.value ?? "",
      senderName: gmailSenderName?.value ?? undefined,
      subjectPrefix: gmailSubjectPrefix?.value ?? undefined,
    },
    baseServices.repositories.oAuthTokenRepository,
    oAuthPort,
  );

  return {
    repositories: baseServices.repositories,
    ports: {
      ...baseServices.ports,
      emailPort,
      oAuthPort,
    },
    useCases: {
      ...baseServices.useCases,
      sendContact: new SendContactUseCase(
        baseServices.repositories.contactRepository,
        emailPort,
        baseServices.repositories.settingRepository,
      ),
    },
  };
}