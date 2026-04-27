import { NextRequest, NextResponse } from "next/server";

import { categories, type Category } from "@/domain/publicApi";
import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { extractWorkAssetKey } from "@/presentation/lib/work-assets";

function redirectWithStatus(request: NextRequest, path: string, status: string): NextResponse {
  const url = new URL(path, request.url);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url, { status: 303 });
}

function getText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : null;
}

function getOptionalText(formData: FormData, key: string): string | null {
  const value = getText(formData, key);
  return value && value.length > 0 ? value : null;
}

function getFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const match = parsed.pathname.match(/\/(embed|shorts|v)\/([^/?]+)/);
      if (match) return match[2] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function getCheckbox(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "1" || value === "on";
}

function getOptionalNumber(formData: FormData, key: string): number | null {
  const value = getText(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isCategory(value: string): value is Category {
  return categories.includes(value as Category);
}

async function uploadFile(services: Awaited<ReturnType<typeof getAdminServices>>, file: File, folder: string): Promise<string> {
  const extension = file.name.includes(".") ? `.${file.name.split(".").pop()}` : "";
  const key = `${folder}/${crypto.randomUUID()}${extension}`;

  return services.ports.storagePort.upload({
    key,
    body: await file.arrayBuffer(),
    contentType: file.type || "application/octet-stream",
  });
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
      thumbnail = await uploadFile(services, thumbnailFile, "works/thumbnails");
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
      const path = await uploadFile(services, file, `works/${workId}/gallery`);
      await services.useCases.addWorkImage.execute(workId, path, null);
    }

    return redirectWithStatus(request, "/admin/works", "updated");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, `/admin/works/${workId}/edit`, "error");
  }
}