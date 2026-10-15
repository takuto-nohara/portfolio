import {
  isValidSlug,
  normalizeSlug,
  type WorkContextCategory,
  type WorkContextCategoryRepository,
} from "@/domain/publicApi";

import { invalidInput, notFound } from "./AdminOperationError";

export interface ContextCategoryFields {
  readonly slug: string;
  readonly nameJa: string;
  readonly nameEn: string;
  readonly sortOrder: number;
}

/**
 * 制作区分（作品の文脈カテゴリ）の管理操作。
 * 削除時は紐づく作品の制作区分が未設定に戻る（リポジトリ側で処理）。
 */
export class ContextCategoryAdminService {
  constructor(private readonly workContextCategoryRepository: WorkContextCategoryRepository) {}

  create(fields: ContextCategoryFields): Promise<WorkContextCategory> {
    return this.workContextCategoryRepository.save({
      ...validate(fields),
      id: null,
      createdAt: null,
      updatedAt: null,
    });
  }

  async update(id: number, patch: Partial<ContextCategoryFields>): Promise<WorkContextCategory> {
    const current = await this.require(id);
    return this.workContextCategoryRepository.save({ ...current, ...validate({ ...current, ...patch }) });
  }

  async delete(id: number): Promise<WorkContextCategory> {
    const current = await this.require(id);
    await this.workContextCategoryRepository.delete(id);
    return current;
  }

  private async require(id: number): Promise<WorkContextCategory> {
    const category = await this.workContextCategoryRepository.findById(id);

    if (!category) {
      throw notFound(`制作区分 ID ${id} が見つかりません。`);
    }

    return category;
  }
}

function validate(fields: ContextCategoryFields): ContextCategoryFields {
  const slug = normalizeSlug(fields.slug);
  const nameJa = fields.nameJa.trim();
  const nameEn = fields.nameEn.trim();

  if (!slug || !isValidSlug(slug)) {
    throw invalidInput("slug は英小文字・数字・ハイフンで指定してください。");
  }

  if (!nameJa || !nameEn) {
    throw invalidInput("nameJa と nameEn は必須です。");
  }

  return { slug, nameJa, nameEn, sortOrder: Number.isFinite(fields.sortOrder) ? fields.sortOrder : 0 };
}
