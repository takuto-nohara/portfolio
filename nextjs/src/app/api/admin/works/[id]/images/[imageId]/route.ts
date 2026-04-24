import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/auth/admin";
import { getAdminServices } from "@/lib/api/services";
import { extractWorkAssetKey } from "@/lib/work-assets";

function redirectWithStatus(request: NextRequest, path: string, status: string): NextResponse {
  const url = new URL(path, request.url);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url);
}

function getText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; imageId: string }> },
): Promise<NextResponse> {
  const session = await getAdminSessionFromRequest(request);
  const { id, imageId } = await context.params;

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent(`/admin/works/${id}/edit`)}`, request.url));
  }

  const workId = Number(id);
  const targetImageId = Number(imageId);

  if (!Number.isInteger(workId) || !Number.isInteger(targetImageId) || workId <= 0 || targetImageId <= 0) {
    return redirectWithStatus(request, "/admin/works", "error");
  }

  const services = await getAdminServices();
  const work = await services.useCases.getWorkDetail.execute(workId);

  if (!work) {
    return redirectWithStatus(request, "/admin/works", "error");
  }

  const image = work.images.find((item) => item.id === targetImageId);

  if (!image) {
    return redirectWithStatus(request, `/admin/works/${workId}/edit`, "error");
  }

  const formData = await request.formData();
  const intent = getText(formData, "intent");

  try {
    if (intent === "delete-image") {
      await services.useCases.deleteWorkImage.execute(targetImageId);
      const assetKey = extractWorkAssetKey(image.imagePath);

      if (assetKey) {
        await services.ports.storagePort.delete(assetKey);
      }

      return redirectWithStatus(request, `/admin/works/${workId}/edit`, "image-deleted");
    }

    await services.useCases.updateWorkImageCaption.execute(targetImageId, getText(formData, "caption"));
    return redirectWithStatus(request, `/admin/works/${workId}/edit`, "caption-saved");
  } catch (error) {
    console.error(error);
    return redirectWithStatus(request, `/admin/works/${workId}/edit`, "error");
  }
}