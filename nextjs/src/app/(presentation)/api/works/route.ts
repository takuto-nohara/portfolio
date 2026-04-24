import { NextRequest, NextResponse } from "next/server";

import { categories } from "@/domain/publicApi";

import { badRequest, internalServerError } from "@worker/lib/api/responses";
import { getAppServices } from "@worker/lib/api/services";

function isCategory(value: string): value is (typeof categories)[number] {
  return categories.includes(value as (typeof categories)[number]);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const services = await getAppServices();
    const featuredParam = request.nextUrl.searchParams.get("featured");
    const categoryParam = request.nextUrl.searchParams.get("category");
    let category: (typeof categories)[number] | null = null;

    if (featuredParam === "1" || featuredParam === "true") {
      const works = await services.useCases.getFeaturedWorks.execute();
      return NextResponse.json({ data: works });
    }

    if (categoryParam) {
      if (!isCategory(categoryParam)) {
        return badRequest("Invalid work category.");
      }

      category = categoryParam;
    }

    const works = await services.useCases.getWorkList.execute(category);

    return NextResponse.json({ data: works });
  } catch (error) {
    return internalServerError(error, "Failed to load works.");
  }
}