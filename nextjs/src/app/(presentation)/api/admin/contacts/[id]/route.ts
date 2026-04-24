import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";

function redirectWithStatus(request: NextRequest, status: string): NextResponse {
  const url = new URL("/admin/contacts", request.url);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);
  const { id } = await context.params;

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent("/admin/contacts")}`, request.url));
  }

  const contactId = Number(id);

  if (!Number.isInteger(contactId) || contactId <= 0) {
    return redirectWithStatus(request, "error");
  }

  try {
    const services = await getAdminServices();
    await services.useCases.deleteContact.execute(contactId);
    return redirectWithStatus(request, "deleted");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "error");
  }
}