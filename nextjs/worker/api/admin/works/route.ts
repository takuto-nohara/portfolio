import { NextRequest, NextResponse } from "next/server";

import { categories, type Category, type Work } from "@/domain/publicApi";
import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";

function redirectWithStatus(request: NextRequest, path: string, status: string): NextResponse {
  const url = new URL(path, request.url);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url);
}

function isCategory(value: string): value is Category {
  return categories.includes(value as Category);
}

function getText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : null;
}

function getOptionalText(formData: FormData, key: string): string | null {
  const value = getText(formData, key);
  return value && value.length > 0 ? value : null;
}

function getCheckbox(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "1" || value === "on";
}

function getNumber(formData: FormData, key: string): number {
  const value = Number(getText(formData, key) ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
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

function createWorkRecord(input: {
  title: string;
  category: Category;
  description: string;
  techStack: string | null;
  thumbnail: string | null;
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
    description: input.description,
    techStack: input.techStack ?? "",
    thumbnail: input.thumbnail,
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

    if (!title || !categoryValue || !description || !isCategory(categoryValue)) {
      return redirectWithStatus(request, "/admin/works/create", "error");
    }

    const services = await getAdminServices();
    const thumbnailFile = getFiles(formData, "thumbnail")[0];
    const galleryFiles = getFiles(formData, "images");
    const thumbnail = thumbnailFile ? await uploadFile(services, thumbnailFile, "works/thumbnails") : null;
    const work = await services.useCases.createWork.execute(
      createWorkRecord({
        title,
        category: categoryValue,
        description,
        techStack: getOptionalText(formData, "tech_stack"),
        thumbnail,
        url: getOptionalText(formData, "url"),
        githubUrl: getOptionalText(formData, "github_url"),
        publishedAt: getOptionalText(formData, "published_at"),
        isFeatured: getCheckbox(formData, "is_featured"),
        sortOrder: getNumber(formData, "sort_order"),
      }),
    );

    if (work.id !== null) {
      for (const file of galleryFiles) {
        const path = await uploadFile(services, file, `works/${work.id}/gallery`);
        await services.useCases.addWorkImage.execute(work.id, path, null);
      }
    }

    return redirectWithStatus(request, "/admin/works", "created");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "/admin/works/create", "error");
  }
}