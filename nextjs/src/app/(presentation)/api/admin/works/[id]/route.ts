import { NextRequest, NextResponse } from "next/server";

import { categories, type Category } from "@/domain/publicApi";
import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { uploadFile } from "@worker/lib/api/upload";
import { extractWorkAssetKey } from "@/presentation/lib/work-assets";
import {
  getCheckbox,
  getFiles,
  getOptionalNumber,
  getOptionalText,
  getText,
  redirectWithStatus,
} from "@/presentation/lib/api/form-helpers";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/presentation/lib/youtube";

function isCategory(value: string): value is Category {
  return categories.includes(value as Category);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);
  const { id } = await context.params;

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent(`/admin/works/${id}/edit`)}`, request.url));
  }

  const workId = Number(id);

  if (!Number.isInteger(workId) || workId <= 0) {
    return redirectWithStatus(request, "/admin/works", "error");
  }

  const services = await getAdminServices();
  const work = await services.useCases.getWorkDetail.execute(workId);

  if (!work) {
    return redirectWithStatus(request, "/admin/works", "error");
  }

  const formData = await request.formData();
  const intent = getText(formData, "intent") ?? "update";

  try {
    if (intent === "delete") {
      const assetKeys = [extractWorkAssetKey(work.thumbnail), ...work.images.map((image) => extractWorkAssetKey(image.imagePath))].filter(
        (value): value is string => Boolean(value),
      );

      await services.useCases.deleteWork.execute(workId);

      for (const assetKey of assetKeys) {
        await services.ports.storagePort.delete(assetKey);
      }

      return redirectWithStatus(request, "/admin/works", "deleted");
    }

    const title = getText(formData, "title");
    const categoryValue = getText(formData, "category");
    const description = getText(formData, "description");
    const contextCategoryId = getOptionalNumber(formData, "context_category_id");

    if (!title || !categoryValue || !description || !isCategory(categoryValue)) {
      return redirectWithStatus(request, `/admin/works/${workId}/edit`, "error");
    }

    if (contextCategoryId !== null) {
      const contextCategory = await services.repositories.workContextCategoryRepository.findById(contextCategoryId);

      if (!contextCategory) {
        return redirectWithStatus(request, `/admin/works/${workId}/edit`, "error");
      }
    }

    const thumbnailFile = getFiles(formData, "thumbnail")[0];
    const galleryFiles = getFiles(formData, "images");
    const thumbnailSource = getOptionalText(formData, "thumbnail_source") ?? "upload";
    const videoUrl = categoryValue === "video" ? getOptionalText(formData, "video_url") : null;
    let thumbnail = work.thumbnail;

    if (thumbnailSource === "youtube" && videoUrl) {
      const videoId = extractYouTubeVideoId(videoUrl);
      const newThumbnail = videoId ? getYouTubeThumbnailUrl(videoId) : null;
      if (newThumbnail && newThumbnail !== work.thumbnail) {
        // 既存のR2サムネイルを削除（YouTubeサムネイルURLは削除しない）
        if (work.thumbnail && !work.thumbnail.startsWith("https://img.youtube.com/")) {
          const oldThumbnailKey = extractWorkAssetKey(work.thumbnail);
          if (oldThumbnailKey) {
            await services.ports.storagePort.delete(oldThumbnailKey);
          }
        }
        thumbnail = newThumbnail;
      }
    } else if (thumbnailSource === "upload" && thumbnailFile) {
      thumbnail = await uploadFile(services.ports.storagePort, thumbnailFile, "works/thumbnails");
      // 既存のR2サムネイルを削除（YouTubeサムネイルURLは削除しない）
      if (work.thumbnail && !work.thumbnail.startsWith("https://img.youtube.com/")) {
        const oldThumbnailKey = extractWorkAssetKey(work.thumbnail);
        if (oldThumbnailKey) {
          await services.ports.storagePort.delete(oldThumbnailKey);
        }
      }
    }

    await services.useCases.updateWork.execute({
      ...work,
      title,
      category: categoryValue,
      contextCategoryId,
      description,
      techStack: getOptionalText(formData, "tech_stack") ?? "",
      thumbnail,
      videoUrl,
      url: getOptionalText(formData, "url"),
      githubUrl: getOptionalText(formData, "github_url"),
      publishedAt: getOptionalText(formData, "published_at"),
      isFeatured: getCheckbox(formData, "is_featured"),
      sortOrder: Number(getText(formData, "sort_order") ?? work.sortOrder),
    });

    for (const file of galleryFiles) {
      const path = await uploadFile(services.ports.storagePort, file, `works/${workId}/gallery`);
      await services.useCases.addWorkImage.execute(workId, path, null);
    }

    return redirectWithStatus(request, "/admin/works", "updated");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, `/admin/works/${workId}/edit`, "error");
  }
}