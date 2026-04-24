import type { PublicSettings, SettingRepository } from "@/domain/publicApi";

export class GetPublicSettingsUseCase {
  constructor(private readonly settingRepository: SettingRepository) {}

  execute(): Promise<PublicSettings> {
    return this.settingRepository.getPublicSettings();
  }
}