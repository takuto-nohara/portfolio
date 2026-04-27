import { NextRequest, NextResponse } from "next/server";

import type { WorkContextCategory } from "@/domain/publicApi";
import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";

function redirectWithStatus(request: NextRequest, status: string): NextResponse {
  const url = new URL("/admin/categories", request.url);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url, { status: 303 });
}

function getText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : null;
}

function getNumber(formData: FormData, key: string): number {
  const value = Number(getText(formData, key) ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function createCategoryRecord(formData: FormData): WorkContextCategory | null {
  const slug = normalizeSlug(getText(formData, "slug") ?? "");
  const nameJa = getText(formData, "name_ja");
  const nameEn = getText(formData, "name_en");

  if (!slug || !nameJa || !nameEn || !isValidSlug(slug)) {
    return null;
  }

  return {
    id: null,
    slug,
    nameJa,
    nameEn,
    sortOrder: getNumber(formData, "sort_order"),
    createdAt: null,
    updatedAt: null,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent("/admin/categories")}`, request.url));
  }

  try {
    const formData = await request.formData();
    const category = createCategoryRecord(formData);

    if (!category) {
      return redirectWithStatus(request, "error");
    }

    const services = await getAdminServices();
    await services.useCases.createWorkContextCategory.execute(category);

    return redirectWithStatus(request, "created");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "error");
  }
}