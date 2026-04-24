import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{
    readonly key: string[];
  }>;
}

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  void request;
  const { key } = await context.params;

  if (!Array.isArray(key) || key.length === 0) {
    return NextResponse.json({ error: "Asset key is required." }, { status: 400 });
  }

  const objectKey = key.map((segment) => decodeURIComponent(segment)).join("/");
  const { env } = await getCloudflareContext({ async: true });
  const asset = await env.R2_BUCKET.get(objectKey);

  if (!asset || !asset.body) {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }

  const headers = new Headers();
  headers.set("cache-control", asset.httpMetadata?.cacheControl ?? "public, max-age=31536000, immutable");

  if (asset.httpMetadata?.contentType) {
    headers.set("content-type", asset.httpMetadata.contentType);
  }

  if (asset.httpMetadata?.contentDisposition) {
    headers.set("content-disposition", asset.httpMetadata.contentDisposition);
  }

  return new NextResponse(asset.body, { headers });
}