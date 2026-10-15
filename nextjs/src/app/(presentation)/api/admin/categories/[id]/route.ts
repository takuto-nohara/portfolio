import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { getNumber, getText, redirectWithStatus } from "@/presentation/lib/api/form-helpers";

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
      await services.admin.contextCategories.delete(categoryId);
      return redirectWithStatus(request, "/admin/categories", "deleted");
    }

    // 未入力の項目は現在の値を維持する
    await services.admin.contextCategories.update(categoryId, {
      ...optional("slug", getText(formData, "slug")),
      ...optional("nameJa", getText(formData, "name_ja")),
      ...optional("nameEn", getText(formData, "name_en")),
      sortOrder: getNumber(formData, "sort_order"),
    });

    return redirectWithStatus(request, "/admin/categories", "updated");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "/admin/categories", "error");
  }
}

function optional<K extends string>(key: K, value: string | null): Partial<Record<K, string>> {
  return value === null ? {} : ({ [key]: value } as Record<K, string>);
}
