import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@worker/lib/auth/admin";
import { getAdminServices } from "@worker/lib/api/services";
import { getText, redirectWithStatus } from "@/presentation/lib/api/form-helpers";
import { readGalleryImages, readThumbnailInput, readWorkFields } from "@/presentation/lib/api/work-form";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);
  const { id } = await context.params;

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent(`/admin/works/${id}/edit`)}`, request.url));
  }

  const workId = Number(id);

  if (!Number.isInteger(workId) || workId <= 0) {
    return redirectWithStatus(request, "/admin/works", "error");
  }

  const services = await getAdminServices();
  const work = await services.useCases.getWorkDetail.execute(workId);

  if (!work) {
    return redirectWithStatus(request, "/admin/works", "error");
  }

  const formData = await request.formData();
  const intent = getText(formData, "intent") ?? "update";

  try {
    if (intent === "delete") {
      await services.admin.works.delete(workId);
      return redirectWithStatus(request, "/admin/works", "deleted");
    }

    if (intent === "toggle-featured") {
      await services.admin.works.update(workId, { isFeatured: !work.isFeatured });
      return redirectWithStatus(request, "/admin/works", work.isFeatured ? "unfeatured" : "featured");
    }

    const fields = readWorkFields(formData, work.sortOrder);

    if (!fields) {
      return redirectWithStatus(request, `/admin/works/${workId}/edit`, "error");
    }

    await services.admin.works.update(workId, fields, {
      thumbnail: await readThumbnailInput(formData, fields),
      images: await readGalleryImages(formData),
    });

    return redirectWithStatus(request, "/admin/works", "updated");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, `/admin/works/${workId}/edit`, "error");
  }
}
