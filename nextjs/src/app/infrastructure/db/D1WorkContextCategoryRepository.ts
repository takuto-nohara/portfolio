import type { WorkContextCategory, WorkContextCategoryRepository } from "@/domain/publicApi";

import { D1DatabaseLike, getLastInsertId, selectAll } from "./D1Database";
import { mapWorkContextCategoryRow, type WorkContextCategoryRow } from "./mappers";

export class D1WorkContextCategoryRepository implements WorkContextCategoryRepository {
  constructor(private readonly database: D1DatabaseLike) {}

  async findAll(): Promise<readonly WorkContextCategory[]> {
    const rows = await selectAll<WorkContextCategoryRow>(
      this.database.prepare(
        `SELECT id, slug, name_ja, name_en, sort_order, created_at, updated_at
         FROM work_context_categories
         ORDER BY sort_order ASC, id ASC`,
      ),
    );

    return rows.map(mapWorkContextCategoryRow);
  }

  async findById(id: number): Promise<WorkContextCategory | null> {
    const row = await this.database
      .prepare(
        `SELECT id, slug, name_ja, name_en, sort_order, created_at, updated_at
         FROM work_context_categories
         WHERE id = ?`,
      )
      .bind(id)
      .first<WorkContextCategoryRow>();

    return row ? mapWorkContextCategoryRow(row) : null;
  }

  async save(category: WorkContextCategory): Promise<WorkContextCategory> {
    if (category.id === null) {
      await this.database
        .prepare(
          `INSERT INTO work_context_categories (slug, name_ja, name_en, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        )
        .bind(category.slug, category.nameJa, category.nameEn, category.sortOrder)
        .run();

      const id = await getLastInsertId(this.database);
      const saved = await this.findById(id);

      if (!saved) {
        throw new Error(`Work context category ${id} could not be reloaded after insert.`);
      }

      return saved;
    }

    await this.database
      .prepare(
        `UPDATE work_context_categories
         SET slug = ?, name_ja = ?, name_en = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      )
      .bind(category.slug, category.nameJa, category.nameEn, category.sortOrder, category.id)
      .run();

    const saved = await this.findById(category.id);

    if (!saved) {
      throw new Error(`Work context category ${category.id} could not be reloaded after update.`);
    }

    return saved;
  }

  delete(id: number): Promise<void> {
    return this.database
      .prepare("UPDATE works SET context_category_id = NULL WHERE context_category_id = ?")
      .bind(id)
      .run()
      .then(() => this.database.prepare("DELETE FROM work_context_categories WHERE id = ?").bind(id).run())
      .then(() => undefined);
  }
}