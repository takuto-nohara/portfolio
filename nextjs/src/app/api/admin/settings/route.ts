import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/auth/admin";
import { getAdminServices } from "@/lib/api/services";

function redirectWithStatus(request: NextRequest, status: string): NextResponse {
  const url = new URL("/admin/settings", request.url);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url);
}

function getText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent("/admin/settings")}`, request.url));
  }

  try {
    const formData = await request.formData();
    const services = await getAdminServices();

    await services.useCases.updateSettings.execute([
      {
        key: "github_url",
        value: getText(formData, "github_url"),
        createdAt: null,
        updatedAt: null,
      },
      {
        key: "contact_email",
        value: getText(formData, "contact_email"),
        createdAt: null,
        updatedAt: null,
      },
    ]);

    return redirectWithStatus(request, "saved");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "error");
  }
}