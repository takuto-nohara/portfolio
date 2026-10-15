import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { getNumber, getText, redirectWithStatus } from "@/presentation/lib/api/form-helpers";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent("/admin/categories")}`, request.url));
  }

  try {
    const formData = await request.formData();
    const services = await getAdminServices();

    await services.admin.contextCategories.create({
      slug: getText(formData, "slug") ?? "",
      nameJa: getText(formData, "name_ja") ?? "",
      nameEn: getText(formData, "name_en") ?? "",
      sortOrder: getNumber(formData, "sort_order"),
    });

    return redirectWithStatus(request, "/admin/categories", "created");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "/admin/categories", "error");
  }
}
