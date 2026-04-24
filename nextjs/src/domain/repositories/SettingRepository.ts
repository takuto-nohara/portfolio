import type { PublicSettings, Setting } from "../entities/Setting";

export interface SettingRepository {
  findByKey(key: string): Promise<Setting | null>;
  findAll(): Promise<readonly Setting[]>;
  save(setting: Setting): Promise<Setting>;
  getPublicSettings(): Promise<PublicSettings>;
}