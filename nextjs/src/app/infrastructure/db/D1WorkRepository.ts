import type { Category, Work, WorkImage, WorkRepository } from "@/domain/publicApi";

import { D1DatabaseLike, getLastInsertId, selectAll } from "./D1Database";
import { mapWorkImageRow, mapWorkRow, WorkImageRow, WorkRow } from "./mappers";

export class D1WorkRepository implements WorkRepository {
  constructor(private readonly database: D1DatabaseLike) {}

  async findAll(): Promise<readonly Work[]> {
    const rows = await selectAll<WorkRow>(
      this.database.prepare(
        `SELECT id, title, category, description, tech_stack, thumbnail, video_url, url, github_url, published_at, is_featured, sort_order, created_at, updated_at
         FROM works
         ORDER BY sort_order ASC, id DESC`,
      ),
    );

    return Promise.all(rows.map((row) => this.mapWork(row)));
  }

  async findByCategory(category: Category): Promise<readonly Work[]> {
    const rows = await selectAll<WorkRow>(
      this.database
        .prepare(
          `SELECT id, title, category, description, tech_stack, thumbnail, video_url, url, github_url, published_at, is_featured, sort_order, created_at, updated_at
           FROM works
           WHERE category = ?
           ORDER BY sort_order ASC, id DESC`,
        )
        .bind(category),
    );

    return Promise.all(rows.map((row) => this.mapWork(row)));
  }

  async findFeatured(): Promise<readonly Work[]> {
    const rows = await selectAll<WorkRow>(
      this.database.prepare(
        `SELECT id, title, category, description, tech_stack, thumbnail, video_url, url, github_url, published_at, is_featured, sort_order, created_at, updated_at
         FROM works
         WHERE is_featured = 1
         ORDER BY sort_order ASC, id DESC`,
      ),
    );

    return Promise.all(rows.map((row) => this.mapWork(row)));
  }

  async findById(id: number): Promise<Work | null> {
    const row = await this.database
      .prepare(
        `SELECT id, title, category, description, tech_stack, thumbnail, video_url, url, github_url, published_at, is_featured, sort_order, created_at, updated_at
         FROM works
         WHERE id = ?`,
      )
      .bind(id)
      .first<WorkRow>();

    return row ? this.mapWork(row) : null;
  }

  async save(work: Work): Promise<Work> {
    if (work.id === null) {
      await this.database
        .prepare(
          `INSERT INTO works (
             title, category, description, tech_stack, thumbnail, video_url, url, github_url, published_at, is_featured, sort_order, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        )
        .bind(
          work.title,
          work.category,
          work.description,
          work.techStack,
          work.thumbnail,
          work.videoUrl,
          work.url,
          work.githubUrl,
          work.publishedAt,
          work.isFeatured ? 1 : 0,
          work.sortOrder,
        )
        .run();

      const id = await getLastInsertId(this.database);
      const saved = await this.findById(id);

      if (!saved) {
        throw new Error(`Work ${id} could not be reloaded after insert.`);
      }

      return saved;
    }

    await this.database
      .prepare(
        `UPDATE works
         SET title = ?, category = ?, description = ?, tech_stack = ?, thumbnail = ?, video_url = ?, url = ?, github_url = ?, published_at = ?, is_featured = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      )
      .bind(
        work.title,
        work.category,
        work.description,
        work.techStack,
        work.thumbnail,
        work.videoUrl,
        work.url,
        work.githubUrl,
        work.publishedAt,
        work.isFeatured ? 1 : 0,
        work.sortOrder,
        work.id,
      )
      .run();

    const saved = await this.findById(work.id);

    if (!saved) {
      throw new Error(`Work ${work.id} could not be reloaded after update.`);
    }

    return saved;
  }

  async delete(id: number): Promise<void> {
    await this.database.prepare("DELETE FROM work_images WHERE work_id = ?").bind(id).run();
    await this.database.prepare("DELETE FROM works WHERE id = ?").bind(id).run();
  }

  async addImage(workId: number, imagePath: string, caption?: string | null): Promise<WorkImage> {
    const sortRow = await this.database
      .prepare(
        `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort_order
         FROM work_images
         WHERE work_id = ?`,
      )
      .bind(workId)
      .first<{ next_sort_order: number }>();

    const nextSortOrder = sortRow?.next_sort_order ?? 0;

    await this.database
      .prepare(
        `INSERT INTO work_images (work_id, image_path, caption, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      )
      .bind(workId, imagePath, caption ?? null, nextSortOrder)
      .run();

    const imageId = await getLastInsertId(this.database);
    const image = await this.database
      .prepare(
        `SELECT id, work_id, image_path, caption, sort_order, created_at, updated_at
         FROM work_images
         WHERE id = ?`,
      )
      .bind(imageId)
      .first<WorkImageRow>();

    if (!image) {
      throw new Error(`Work image ${imageId} could not be reloaded after insert.`);
    }

    return mapWorkImageRow(image);
  }

  updateImageCaption(imageId: number, caption?: string | null): Promise<void> {
    return this.database
      .prepare("UPDATE work_images SET caption = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(caption ?? null, imageId)
      .run()
      .then(() => undefined);
  }

  deleteImage(imageId: number): Promise<void> {
    return this.database.prepare("DELETE FROM work_images WHERE id = ?").bind(imageId).run().then(() => undefined);
  }

  async getImages(workId: number): Promise<readonly WorkImage[]> {
    const rows = await selectAll<WorkImageRow>(
      this.database
        .prepare(
          `SELECT id, work_id, image_path, caption, sort_order, created_at, updated_at
           FROM work_images
           WHERE work_id = ?
           ORDER BY sort_order ASC, id ASC`,
        )
        .bind(workId),
    );

    return rows.map(mapWorkImageRow);
  }

  private async mapWork(row: WorkRow): Promise<Work> {
    const images = await this.getImages(row.id);
    return mapWorkRow(row, images);
  }
}