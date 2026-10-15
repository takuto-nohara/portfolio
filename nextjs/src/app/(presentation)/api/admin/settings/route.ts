import { NextRequest, NextResponse } from "next/server";

import { settingKeys } from "@/application/publicApi";
import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { getText, redirectWithStatus } from "@/presentation/lib/api/form-helpers";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent("/admin/settings")}`, request.url));
  }

  try {
    const formData = await request.formData();
    const services = await getAdminServices();

    await services.admin.settings.update(Object.fromEntries(settingKeys.map((key) => [key, getText(formData, key)])));

    return redirectWithStatus(request, "/admin/settings", "saved");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "/admin/settings", "error");
  }
}
