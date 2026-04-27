import { NextRequest, NextResponse } from "next/server";

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
    const oauthToken = await services.repositories.oAuthTokenRepository.findByProvider("google");
    const linkedEmail = oauthToken?.email ?? null;

    await services.useCases.updateSettings.execute([
      {
        key: "github_url",
        value: getText(formData, "github_url"),
        createdAt: null,
        updatedAt: null,
      },
      {
        key: "contact_email",
        value: linkedEmail ?? getText(formData, "contact_email"),
        createdAt: null,
        updatedAt: null,
      },
      {
        key: "gmail_from_email",
        value: linkedEmail ?? getText(formData, "gmail_from_email"),
        createdAt: null,
        updatedAt: null,
      },
      {
        key: "gmail_sender_name",
        value: getText(formData, "gmail_sender_name"),
        createdAt: null,
        updatedAt: null,
      },
      {
        key: "gmail_subject_prefix",
        value: getText(formData, "gmail_subject_prefix"),
        createdAt: null,
        updatedAt: null,
      },
    ]);

    return redirectWithStatus(request, "/admin/settings", "saved");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "/admin/settings", "error");
  }
}