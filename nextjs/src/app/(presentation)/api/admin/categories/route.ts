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
      return redirectWithStatus(request, "/admin/categories", "error");
    }

    const services = await getAdminServices();
    await services.useCases.createWorkContextCategory.execute(category);

    return redirectWithStatus(request, "/admin/categories", "created");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "/admin/categories", "error");
  }
}