import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { redirectWithStatus } from "@/presentation/lib/api/form-helpers";
import { readGalleryImages, readThumbnailInput, readWorkFields } from "@/presentation/lib/api/work-form";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent("/admin/works/create")}`, request.url));
  }

  try {
    const formData = await request.formData();
    const fields = readWorkFields(formData);

    if (!fields) {
      return redirectWithStatus(request, "/admin/works/create", "error");
    }

    const services = await getAdminServices();
    await services.admin.works.create(fields, {
      thumbnail: await readThumbnailInput(formData, fields),
      images: await readGalleryImages(formData),
    });

    return redirectWithStatus(request, "/admin/works", "created");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, "/admin/works/create", "error");
  }
}
