import type { Work } from "../entities/Work";
import type { WorkImage } from "../entities/WorkImage";
import type { Category } from "../valueObjects/Category";

export interface WorkRepository {
  findAll(): Promise<readonly Work[]>;
  findByCategory(category: Category): Promise<readonly Work[]>;
  findFeatured(): Promise<readonly Work[]>;
  findById(id: number): Promise<Work | null>;
  save(work: Work): Promise<Work>;
  delete(id: number): Promise<void>;
  addImage(workId: number, imagePath: string, caption?: string | null): Promise<WorkImage>;
  updateImageCaption(imageId: number, caption?: string | null): Promise<void>;
  deleteImage(imageId: number): Promise<void>;
  getImages(workId: number): Promise<readonly WorkImage[]>;
}