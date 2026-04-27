import { NextRequest, NextResponse } from "next/server";

import { categories, type Category, type Work } from "@/domain/publicApi";
import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { uploadFile } from "@worker/lib/api/upload";
import {
  getCheckbox,
  getFiles,
  getNumber,
  getOptionalNumber,
  getOptionalText,
  getText,
  redirectWithStatus,
} from "@/presentation/lib/api/form-helpers";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/presentation/lib/youtube";

function isCategory(value: string): value is Category {
  return categories.includes(value as Category);
}

function createWorkRecord(input: {
  title: string;
  category: Category;
  contextCategoryId: number | null;
  description: string;
  techStack: string | null;
  thumbnail: string | null;
  videoUrl: string | null;
  url: string | null;
  githubUrl: string | null;
  publishedAt: string | null;
  isFeatured: boolean;
  sortOrder: number;
}): Work {
  return {
    id: null,
    title: input.title,
    category: input.category,
    contextCategoryId: input.contextCategoryId,
    contextCategorySlug: null,
    contextCategoryNameJa: null,
    contextCategoryNameEn: null,
    description: input.description,
    techStack: input.techStack ?? "",
    thumbnail: input.thumbnail,
    videoUrl: input.videoUrl,
    url: input.url,
    githubUrl: input.githubUrl,
    publishedAt: input.publishedAt,
    isFeatured: input.isFeatured,
    sortOrder: input.sortOrder,
    createdAt: null,
    updatedAt: null,
    images: [],
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent("/admin/works/create")}`, request.url));
  }

  try {
    const formData = await request.formData();
    const title = getText(formData, "title");
    const categoryValue = getText(formData, "category");
    const description = getText(formData, "description");
    const contextCategoryId = getOptionalNumber(formData, "context_category_id");

    if (!title || !categoryValue || !description || !isCategory(categoryValue)) {
      return redirectWithStatus(request, "/admin/works/create", "error");
    }

    const services = await getAdminServices();
    const thumbnailFile = getFiles(formData, "thumbnail")[0];
    const galleryFiles = getFiles(formData, "images");
    const thumbnailSource = getOptionalText(formData, "thumbnail_source") ?? "upload";
    const videoUrl = categoryValue === "video" ? getOptionalText(formData, "video_url") : null;

    if (contextCategoryId !== null) {
      const contextCategory = await services.repositories.workContextCategoryRepository.findById(contextCategoryId);

      if (!contextCategory) {
        return redirectWithStatus(request, "/admin/works/create", "error");
      }
    }

    let thumbnail: string | null = null;
    if (thumbnailSource === "youtube" && videoUrl) {
      const videoId = extractYouTubeVideoId(videoUrl);
      thumbnail = videoId ? getYouTubeThumbnailUrl(videoId) : null;
    } else if (thumbnailFile) {
      thumbnail = await uploadFile(services.ports.storagePort, thumbnailFile, "works/thumbnails");
    }

    const work = await services.useCases.createWork.execute(
      createWorkRecord({
        title,
        category: categoryValue,
        contextCategoryId,
        description,
        techStack: getOptionalText(formData, "tech_stack"),
        thumbnail,
        videoUrl,
        url: getOptionalText(formData, "url"),
        githubUrl: getOptionalText(formData, "github_url"),
        publishedAt: getOptionalText(formData, "published_at"),
        isFeatured: getCheckbox(formData, "is_featured"),
        sortOrder: getNumber(formData, "sort_order"),
      }),
    );

    if (work.id !== null) {
      for (const file of galleryFiles) {
        const path = await uploadFile(services.ports.storagePort, file, `works/${work.id}/gallery`);
        await services.useCases.addWorkImage.execute(work.id, path, null);
      }
    }

    return redirectWithStatus(request, "/admin/works", "created");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "/admin/works/create", "error");
  }
}