import { NextResponse } from "next/server";

import { badRequest, internalServerError, notFound } from "@worker/lib/api/responses";
import { getReadServices } from "@worker/lib/api/services";

interface RouteContext {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    void request;
    const { id } = await context.params;
    const workId = Number(id);

    if (!Number.isInteger(workId) || workId <= 0) {
      return badRequest("Invalid work id.");
    }

    const services = await getReadServices();
    const work = await services.useCases.getWorkDetail.execute(workId);

    if (!work) {
      return notFound("Work not found.");
    }

    return NextResponse.json({ data: work });
  } catch (error) {
    return internalServerError(error, "Failed to load work detail.");
  }
}