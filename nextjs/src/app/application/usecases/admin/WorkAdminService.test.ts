import { beforeEach, describe, expect, it } from "vitest";

import type { Work, WorkContextCategory, WorkContextCategoryRepository, WorkImage, WorkRepository } from "@/domain/publicApi";

import type { StoragePort, StorageUploadInput } from "../../ports/StoragePort";
import { AdminOperationError } from "./AdminOperationError";
import { WorkAdminService, type WorkFields } from "./WorkAdminService";

class MemoryWorkRepository implements WorkRepository {
  readonly works = new Map<number, Work>();
  private nextId = 1;
  private nextImageId = 1;

  async findAll() {
    return [...this.works.values()];
  }
  async findByCategory() {
    return [...this.works.values()];
  }
  async findFeatured() {
    return [...this.works.values()].filter((work) => work.isFeatured);
  }
  async findById(id: number) {
    return this.works.get(id) ?? null;
  }
  async save(work: Work) {
    const saved = { ...work, id: work.id ?? this.nextId++, images: work.id === null ? [] : (this.works.get(work.id)?.images ?? []) };
    this.works.set(saved.id, saved);
    return saved;
  }
  async delete(id: number) {
    this.works.delete(id);
  }
  async addImage(workId: number, imagePath: string, caption?: string | null) {
    const work = this.works.get(workId);
    const image: WorkImage = { id: this.nextImageId++, workId, imagePath, caption: caption ?? null, sortOrder: work?.images.length ?? 0, createdAt: null, updatedAt: null };
    if (work) this.works.set(workId, { ...work, images: [...work.images, image] });
    return image;
  }
  async updateImageCaption(imageId: number, caption?: string | null) {
    for (const work of this.works.values()) {
      this.works.set(work.id ?? 0, { ...work, images: work.images.map((image) => (image.id === imageId ? { ...image, caption: caption ?? null } : image)) });
    }
  }
  async deleteImage(imageId: number) {
    for (const work of this.works.values()) {
      this.works.set(work.id ?? 0, { ...work, images: work.images.filter((image) => image.id !== imageId) });
    }
  }
  async getImages(workId: number) {
    return this.works.get(workId)?.images ?? [];
  }
}

class MemoryStorage implements StoragePort {
  readonly objects = new Set<string>();
  readonly deleted: string[] = [];

  async upload(input: StorageUploadInput) {
    this.objects.add(input.key);
    return `/api/assets/${input.key}`;
  }
  async delete(key: string) {
    this.deleted.push(key);
    this.objects.delete(key);
  }
}

const category: WorkContextCategory = { id: 5, slug: "team", nameJa: "チーム", nameEn: "Team", sortOrder: 0, createdAt: null, updatedAt: null };
const categories: WorkContextCategoryRepository = {
  findAll: async () => [category],
  findById: async (id) => (id === category.id ? category : null),
  save: async (value) => value,
  delete: async () => undefined,
};

const fields: WorkFields = {
  title: "作品",
  category: "web",
  contextCategoryId: null,
  lead: null,
  role: null,
  description: "説明",
  techDescription: null,
  background: null,
  techStack: "",
  thumbnailFit: "contain",
  videoUrl: "https://youtu.be/abc",
  url: null,
  githubUrl: null,
  publishedAt: null,
  isFeatured: false,
  sortOrder: 0,
};

const file = (name: string) => ({ bytes: new Uint8Array([1, 2, 3]), contentType: "image/png", filename: name });

describe("WorkAdminService", () => {
  let works: MemoryWorkRepository;
  let storage: MemoryStorage;
  let service: WorkAdminService;

  beforeEach(() => {
    works = new MemoryWorkRepository();
    storage = new MemoryStorage();
    service = new WorkAdminService(works, categories, storage);
  });

  it("作成時にサムネイルとギャラリーを R2 に置き、映像以外の動画 URL は捨てる", async () => {
    const work = await service.create(fields, { thumbnail: { source: "file", file: file("a.png") }, images: [{ file: file("b.png"), caption: "1" }] });

    expect(work.thumbnail).toMatch(/^\/api\/assets\/works\/thumbnails\/.+\.png$/);
    expect(work.images).toHaveLength(1);
    expect(work.images[0]?.imagePath).toContain(`works/${work.id}/gallery/`);
    expect(work.videoUrl).toBeNull();
  });

  it("サムネイルを差し替えると古い画像を消す。YouTube の画像は消さない", async () => {
    const work = await service.create({ ...fields, category: "video" }, { thumbnail: { source: "youtube" } });
    expect(work.thumbnail).toBe("https://img.youtube.com/vi/abc/maxresdefault.jpg");

    const uploaded = await service.update(work.id ?? 0, {}, { thumbnail: { source: "file", file: file("c.png") } });
    expect(storage.deleted).toEqual([]);

    await service.update(work.id ?? 0, {}, { thumbnail: { source: "file", file: file("d.png") } });
    expect(storage.deleted).toEqual([uploaded.thumbnail?.replace("/api/assets/", "")]);
  });

  it("指定した項目だけを更新する", async () => {
    const work = await service.create(fields);
    const updated = await service.update(work.id ?? 0, { isFeatured: true, contextCategoryId: 5 });
    expect(updated).toMatchObject({ title: "作品", isFeatured: true, contextCategoryId: 5 });
  });

  it("削除すると作品の画像をすべて消す", async () => {
    const work = await service.create(fields, { thumbnail: { source: "file", file: file("a.png") }, images: [{ file: file("b.png") }] });
    await service.delete(work.id ?? 0);
    expect(storage.objects.size).toBe(0);
    expect(works.works.size).toBe(0);
  });

  it("入力不備・存在しない対象は AdminOperationError", async () => {
    await expect(service.create({ ...fields, title: " " })).rejects.toThrowError(AdminOperationError);
    await expect(service.create({ ...fields, contextCategoryId: 999 })).rejects.toThrowError("制作区分 ID 999");
    await expect(service.update(999, {})).rejects.toMatchObject({ code: "not_found" });

    const work = await service.create(fields);
    await expect(service.deleteImage(work.id ?? 0, 999)).rejects.toMatchObject({ code: "not_found" });
  });
});
