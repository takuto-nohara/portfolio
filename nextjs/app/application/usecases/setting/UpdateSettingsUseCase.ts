import type { Setting, SettingRepository } from "@/domain/publicApi";

export class UpdateSettingsUseCase {
  constructor(private readonly settingRepository: SettingRepository) {}

  execute(settings: readonly Setting[]): Promise<readonly Setting[]> {
    return Promise.all(settings.map((setting) => this.settingRepository.save(setting)));
  }
}