import type { PublicSettings, Setting, SettingRepository } from "@/domain/publicApi";

import { D1DatabaseLike, selectAll } from "./D1Database";
import { mapSettingRow, SettingRow } from "./mappers";

export class D1SettingRepository implements SettingRepository {
  constructor(private readonly database: D1DatabaseLike) {}

  async findByKey(key: string): Promise<Setting | null> {
    const row = await this.database
      .prepare(
        `SELECT key, value, created_at, updated_at
         FROM settings
         WHERE key = ?`,
      )
      .bind(key)
      .first<SettingRow>();

    return row ? mapSettingRow(row) : null;
  }

  async findAll(): Promise<readonly Setting[]> {
    const rows = await selectAll<SettingRow>(
      this.database.prepare(
        `SELECT key, value, created_at, updated_at
         FROM settings
         ORDER BY key ASC`,
      ),
    );

    return rows.map(mapSettingRow);
  }

  async save(setting: Setting): Promise<Setting> {
    await this.database
      .prepare(
        `INSERT INTO settings (key, value, created_at, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updated_at = CURRENT_TIMESTAMP`,
      )
      .bind(setting.key, setting.value)
      .run();

    const saved = await this.findByKey(setting.key);

    if (!saved) {
      throw new Error(`Setting ${setting.key} could not be reloaded after save.`);
    }

    return saved;
  }

  async getPublicSettings(): Promise<PublicSettings> {
    const rows = await selectAll<SettingRow>(
      this.database
        .prepare(
          `SELECT key, value, created_at, updated_at
           FROM settings
           WHERE key IN (?, ?)`,
        )
        .bind("github_url", "contact_email"),
    );

    const values = new Map(rows.map((row) => [row.key, row.value]));

    return {
      githubUrl: values.get("github_url") ?? null,
      contactEmail: values.get("contact_email") ?? null,
    };
  }
}