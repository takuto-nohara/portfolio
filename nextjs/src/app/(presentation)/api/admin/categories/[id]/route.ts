import { NextRequest, NextResponse } from "next/server";

import type { WorkContextCategory } from "@/domain/publicApi";
import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import {
  getText,
  getNumber,
  isValidSlug,
  normalizeSlug,
  redirectWithStatus,
} from "@/presentation/lib/api/form-helpers";

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
    return redirectWithStatus(request, "/admin/categories", "error");
  }

  try {
    const services = await getAdminServices();
    const formData = await request.formData();
    const intent = getText(formData, "intent") ?? "update";

    if (intent === "delete") {
      await services.useCases.deleteWorkContextCategory.execute(categoryId);
      return redirectWithStatus(request, "/admin/categories", "deleted");
    }

    const current = await services.repositories.workContextCategoryRepository.findById(categoryId);

    if (!current) {
      return redirectWithStatus(request, "/admin/categories", "error");
    }

    const category = updateCategoryRecord(categoryId, formData, current);

    if (!category) {
      return redirectWithStatus(request, "/admin/categories", "error");
    }

    await services.useCases.updateWorkContextCategory.execute(category);
    return redirectWithStatus(request, "/admin/categories", "updated");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "/admin/categories", "error");
  }
}