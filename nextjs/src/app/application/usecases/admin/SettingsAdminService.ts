import type { OAuthTokenRepository, Setting, SettingRepository } from "@/domain/publicApi";

export const settingKeys = [
  "github_url",
  "contact_email",
  "gmail_from_email",
  "gmail_sender_name",
  "gmail_subject_prefix",
] as const;

export type SettingKey = (typeof settingKeys)[number];

export type SettingsPatch = Partial<Record<SettingKey, string | null>>;

/** Google 連携中はこのメールアドレスで上書きされるキー */
const linkedEmailKeys: readonly SettingKey[] = ["contact_email", "gmail_from_email"];

export interface AdminSettingsView {
  readonly values: Record<SettingKey, string | null>;
  readonly googleLinkedEmail: string | null;
}

export class SettingsAdminService {
  constructor(
    private readonly settingRepository: SettingRepository,
    private readonly oAuthTokenRepository: OAuthTokenRepository,
  ) {}

  async get(): Promise<AdminSettingsView> {
    const [settings, token] = await Promise.all([
      this.settingRepository.findAll(),
      this.oAuthTokenRepository.findByProvider("google"),
    ]);
    const values = Object.fromEntries(settingKeys.map((key) => [key, null])) as Record<SettingKey, string | null>;

    for (const setting of settings) {
      if ((settingKeys as readonly string[]).includes(setting.key)) {
        values[setting.key as SettingKey] = setting.value;
      }
    }

    return { values, googleLinkedEmail: token?.email ?? null };
  }

  /** 指定したキーだけを保存する。Google 連携中はメール系のキーを連携アカウントで上書きする。 */
  async update(patch: SettingsPatch): Promise<AdminSettingsView> {
    const token = await this.oAuthTokenRepository.findByProvider("google");
    const linkedEmail = token?.email ?? null;
    const settings: Setting[] = settingKeys
      .filter((key) => key in patch)
      .map((key) => ({
        key,
        value: linkedEmail && linkedEmailKeys.includes(key) ? linkedEmail : (patch[key] ?? null),
        createdAt: null,
        updatedAt: null,
      }));

    await Promise.all(settings.map((setting) => this.settingRepository.save(setting)));
    return this.get();
  }
}
