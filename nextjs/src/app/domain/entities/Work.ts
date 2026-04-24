import type { Category } from "../valueObjects/Category";
import type { WorkImage } from "./WorkImage";

export interface Work {
  readonly id: number | null;
  readonly title: string;
  readonly category: Category;
  readonly description: string;
  readonly techStack: string;
  readonly thumbnail: string | null;
  readonly videoUrl: string | null;
  readonly url: string | null;
  readonly githubUrl: string | null;
  readonly publishedAt: string | null;
  readonly isFeatured: boolean;
  readonly sortOrder: number;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
  readonly images: readonly WorkImage[];
}