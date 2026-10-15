import type { Category } from "../valueObjects/Category";
import type { WorkImage } from "./WorkImage";

export const thumbnailFits = ["cover", "contain"] as const;

export type ThumbnailFit = (typeof thumbnailFits)[number];

export function toThumbnailFit(value: string | null | undefined): ThumbnailFit {
  return value === "cover" ? "cover" : "contain";
}

export interface Work {
  readonly id: number | null;
  readonly title: string;
  readonly category: Category;
  readonly contextCategoryId: number | null;
  readonly contextCategorySlug: string | null;
  readonly contextCategoryNameJa: string | null;
  readonly contextCategoryNameEn: string | null;
  readonly lead: string | null;
  readonly role: string | null;
  readonly description: string;
  readonly techDescription: string | null;
  readonly background: string | null;
  readonly techStack: string;
  readonly thumbnail: string | null;
  readonly thumbnailFit: ThumbnailFit;
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
