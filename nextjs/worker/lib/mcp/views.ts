import type { Work, WorkContextCategory } from "@/domain/publicApi";

/**
 * MCP の結果に載せる形。画像は AI ツールからそのまま開けるよう絶対 URL にする。
 */

function absoluteUrl(path: string | null, origin: string): string | null {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return new URL(path.startsWith("/") ? path : `/api/assets/${path}`, origin).toString();
}

export function workSummary(work: Work, origin: string): Record<string, unknown> {
  return {
    id: work.id,
    title: work.title,
    category: work.category,
    contextCategoryId: work.contextCategoryId,
    contextCategorySlug: work.contextCategorySlug,
    lead: work.lead,
    thumbnailUrl: absoluteUrl(work.thumbnail, origin),
    publishedAt: work.publishedAt,
    isFeatured: work.isFeatured,
    sortOrder: work.sortOrder,
    imageCount: work.images.length,
    publicUrl: work.id === null ? null : `${origin}/works/${work.id}`,
  };
}

export function workDetail(work: Work, origin: string): Record<string, unknown> {
  return {
    ...workSummary(work, origin),
    contextCategoryNameJa: work.contextCategoryNameJa,
    contextCategoryNameEn: work.contextCategoryNameEn,
    role: work.role,
    description: work.description,
    techDescription: work.techDescription,
    background: work.background,
    techStack: work.techStack,
    thumbnailFit: work.thumbnailFit,
    videoUrl: work.videoUrl,
    url: work.url,
    githubUrl: work.githubUrl,
    createdAt: work.createdAt,
    updatedAt: work.updatedAt,
    images: work.images.map((image) => ({
      id: image.id,
      url: absoluteUrl(image.imagePath, origin),
      caption: image.caption,
      sortOrder: image.sortOrder,
    })),
  };
}

export function contextCategoryView(category: WorkContextCategory): Record<string, unknown> {
  return {
    id: category.id,
    slug: category.slug,
    nameJa: category.nameJa,
    nameEn: category.nameEn,
    sortOrder: category.sortOrder,
  };
}
