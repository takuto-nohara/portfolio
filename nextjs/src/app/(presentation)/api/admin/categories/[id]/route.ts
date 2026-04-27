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

function updateCategoryRecord(id: number, formData: FormData, current: WorkContextCategory): WorkContextCategory | null {
  const slug = normalizeSlug(getText(formData, "slug") ?? current.slug);
  const nameJa = getText(formData, "name_ja") ?? current.nameJa;
  const nameEn = getText(formData, "name_en") ?? current.nameEn;

  if (!slug || !nameJa || !nameEn || !isValidSlug(slug)) {
    return null;
  }

  return {
    ...current,
    id,
    slug,
    nameJa,
    nameEn,
    sortOrder: getNumber(formData, "sort_order"),
  };
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);
  const { id } = await context.params;

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent("/admin/categories")}`, request.url));
  }

  const categoryId = Number(id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return redirectWithStatus(request, "error");
  }

  try {
    const services = await getAdminServices();
    const formData = await request.formData();
    const intent = getText(formData, "intent") ?? "update";

    if (intent === "delete") {
      await services.useCases.deleteWorkContextCategory.execute(categoryId);
      return redirectWithStatus(request, "deleted");
    }

    const current = await services.repositories.workContextCategoryRepository.findById(categoryId);

    if (!current) {
      return redirectWithStatus(request, "error");
    }

    const category = updateCategoryRecord(categoryId, formData, current);

    if (!category) {
      return redirectWithStatus(request, "error");
    }

    await services.useCases.updateWorkContextCategory.execute(category);
    return redirectWithStatus(request, "updated");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "error");
  }
}