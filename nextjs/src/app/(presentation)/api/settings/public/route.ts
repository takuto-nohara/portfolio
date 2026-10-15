import { NextResponse } from "next/server";

import { internalServerError } from "@worker/lib/api/responses";
import { getReadServices } from "@worker/lib/api/services";

export async function GET(): Promise<NextResponse> {
  try {
    const services = await getReadServices();
    const settings = await services.useCases.getPublicSettings.execute();

    return NextResponse.json({ data: settings });
  } catch (error) {
    return internalServerError(error, "Failed to load public settings.");
  }
}