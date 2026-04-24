import { NextResponse } from "next/server";

import { internalServerError } from "@worker/lib/api/responses";
import { getAppServices } from "@worker/lib/api/services";

export async function GET(): Promise<NextResponse> {
  try {
    const services = await getAppServices();
    const settings = await services.useCases.getPublicSettings.execute();

    return NextResponse.json({ data: settings });
  } catch (error) {
    return internalServerError(error, "Failed to load public settings.");
  }
}