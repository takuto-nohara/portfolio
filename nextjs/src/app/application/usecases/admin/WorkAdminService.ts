import {
  categories,
  extractWorkAssetKey,
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  isYouTubeThumbnailUrl,
  type Category,
  type ThumbnailFit,
  type Work,
  type WorkContextCategoryRepository,
  type WorkImage,
  type WorkRepository,
} from "@/domain/publicApi";

import type { StoragePort } from "../../ports/StoragePort";
import { invalidInput, notFound } from "./AdminOperationError";

export interface UploadFile {
  readonly bytes: ArrayBuffer | Uint8Array;
  readonly contentType: string;
  readonly filename: string;
}

/** サムネイルの指定。youtube は作品の videoUrl（または指定 URL）から画像 URL を組み立てる。 */
export type ThumbnailInput =
  | { readonly source: "file"; readonly file: UploadFile }
  | { readonly source: "youtube"; readonly videoUrl?: string | null };

export interface GalleryImageInput {
  readonly file: UploadFile;
  readonly caption?: string | null;
}

export interface WorkFields {
  readonly title: string;
  readonly category: Category;
  readonly contextCategoryId: number | null;
  readonly lead: string | null;
  readonly role: string | null;
  readonly description: string;
  readonly techDescription: string | null;
  readonly background: string | null;
  readonly techStack: string;
  readonly thumbnailFit: ThumbnailFit;
  readonly videoUrl: string | null;
  readonly url: string | null;
  readonly githubUrl: string | null;
  readonly publishedAt: string | null;
  readonly isFeatured: boolean;
  readonly sortOrder: number;
}

export interface WorkMediaOptions {
  readonly thumbnail?: ThumbnailInput | null;
  readonly images?: readonly GalleryImageInput[];
}

const THUMBNAIL_FOLDER = "works/thumbnails";

export function isCategory(value: string): value is Category {
  return categories.includes(value as Category);
}

function galleryFolder(workId: number): string {
  return `works/${workId}/gallery`;
}

function buildAssetKey(folder: string, filename: string): string {
  const extension = filename.includes(".") ? `.${filename.split(".").pop()}` : "";
  return `${folder}/${crypto.randomUUID()}${extension}`;
}

/**
 * 作品と画像の管理操作をまとめたサービス。
 * 管理画面のフォーム route と MCP ツールの両方から呼ばれる。
 */
export class WorkAdminService {
  constructor(
    private readonly workRepository: WorkRepository,
    private readonly workContextCategoryRepository: WorkContextCategoryRepository,
    private readonly storagePort: StoragePort,
  ) {}

  async create(fields: WorkFields, options: WorkMediaOptions = {}): Promise<Work> {
    const normalized = await this.validate(fields);
    const thumbnail = options.thumbnail ? await this.resolveThumbnail(options.thumbnail, normalized.videoUrl) : null;
    const created = await this.workRepository.save({
      ...normalized,
      id: null,
      contextCategorySlug: null,
      contextCategoryNameJa: null,
      contextCategoryNameEn: null,
      thumbnail,
      createdAt: null,
      updatedAt: null,
      images: [],
    });

    if (created.id === null) {
      throw new Error("Failed to create work.");
    }

    await this.addImages(created.id, options.images ?? []);
    return this.requireWork(created.id);
  }

  async update(workId: number, patch: Partial<WorkFields>, options: WorkMediaOptions = {}): Promise<Work> {
    const work = await this.requireWork(workId);
    const normalized = await this.validate({ ...work, ...patch });
    const thumbnail = options.thumbnail ? await this.replaceThumbnail(work, options.thumbnail, normalized.videoUrl) : work.thumbnail;

    await this.workRepository.save({ ...work, ...normalized, thumbnail });
    await this.addImages(workId, options.images ?? []);
    return this.requireWork(workId);
  }

  async delete(workId: number): Promise<Work> {
    const work = await this.requireWork(workId);
    const assetKeys = [work.thumbnail, ...work.images.map((image) => image.imagePath)]
      .map((path) => extractWorkAssetKey(path))
      .filter((value): value is string => Boolean(value));

    await this.workRepository.delete(workId);

    for (const assetKey of assetKeys) {
      await this.storagePort.delete(assetKey);
    }

    return work;
  }

  async addImages(workId: number, images: readonly GalleryImageInput[]): Promise<readonly WorkImage[]> {
    const added: WorkImage[] = [];

    for (const image of images) {
      const path = await this.upload(image.file, galleryFolder(workId));
      added.push(await this.workRepository.addImage(workId, path, image.caption ?? null));
    }

    return added;
  }

  async updateImageCaption(workId: number, imageId: number, caption: string | null): Promise<void> {
    await this.requireImage(workId, imageId);
    await this.workRepository.updateImageCaption(imageId, caption);
  }

  async deleteImage(workId: number, imageId: number): Promise<WorkImage> {
    const image = await this.requireImage(workId, imageId);
    await this.workRepository.deleteImage(imageId);
    await this.deleteAsset(image.imagePath);
    return image;
  }

  async requireWork(workId: number): Promise<Work> {
    const work = await this.workRepository.findById(workId);

    if (!work) {
      throw notFound(`作品 ID ${workId} が見つかりません。`);
    }

    return work;
  }

  private async requireImage(workId: number, imageId: number): Promise<WorkImage> {
    const work = await this.requireWork(workId);
    const image = work.images.find((item) => item.id === imageId);

    if (!image) {
      throw notFound(`作品 ID ${workId} に画像 ID ${imageId} はありません。`);
    }

    return image;
  }

  private async validate(fields: WorkFields): Promise<WorkFields> {
    const title = fields.title.trim();
    const description = fields.description.trim();

    if (!title || !description) {
      throw invalidInput("title と description は必須です。");
    }

    if (!isCategory(fields.category)) {
      throw invalidInput(`category は ${categories.join(" / ")} のいずれかです。`);
    }

    if (fields.contextCategoryId !== null) {
      const contextCategory = await this.workContextCategoryRepository.findById(fields.contextCategoryId);

      if (!contextCategory) {
        throw invalidInput(`制作区分 ID ${fields.contextCategoryId} が見つかりません。`);
      }
    }

    return {
      ...fields,
      title,
      description,
      techStack: fields.techStack ?? "",
      // 動画 URL は映像カテゴリの作品だけが持つ
      videoUrl: fields.category === "video" ? fields.videoUrl : null,
    };
  }

  private async resolveThumbnail(input: ThumbnailInput, videoUrl: string | null): Promise<string | null> {
    if (input.source === "file") {
      return this.upload(input.file, THUMBNAIL_FOLDER);
    }

    const sourceUrl = input.videoUrl ?? videoUrl;
    const videoId = sourceUrl ? extractYouTubeVideoId(sourceUrl) : null;
    return videoId ? getYouTubeThumbnailUrl(videoId) : null;
  }

  private async replaceThumbnail(work: Work, input: ThumbnailInput, videoUrl: string | null): Promise<string | null> {
    const thumbnail = await this.resolveThumbnail(input, videoUrl);

    if (!thumbnail || thumbnail === work.thumbnail) {
      return work.thumbnail;
    }

    await this.deleteAsset(work.thumbnail);
    return thumbnail;
  }

  private upload(file: UploadFile, folder: string): Promise<string> {
    return this.storagePort.upload({
      key: buildAssetKey(folder, file.filename),
      body: file.bytes,
      contentType: file.contentType || "application/octet-stream",
    });
  }

  private async deleteAsset(path: string | null): Promise<void> {
    // YouTube のサムネイル URL は R2 にないので削除しない
    if (isYouTubeThumbnailUrl(path)) {
      return;
    }

    const assetKey = extractWorkAssetKey(path);

    if (assetKey) {
      await this.storagePort.delete(assetKey);
    }
  }
}
