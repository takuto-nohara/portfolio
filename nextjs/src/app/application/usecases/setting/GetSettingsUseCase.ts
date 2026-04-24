import type { Setting, SettingRepository } from "@/domain/publicApi";

export class GetSettingsUseCase {
  constructor(private readonly settingRepository: SettingRepository) {}

  execute(): Promise<readonly Setting[]> {
    return this.settingRepository.findAll();
  }
}