import type { PublicSettings, Work } from "@/domain/publicApi";

import { getAppServices } from "@/lib/api/services";

const fallbackSettings: PublicSettings = {
  githubUrl: null,
  contactEmail: null,
};

export async function getSiteSettings(): Promise<PublicSettings> {
  try {
    const services = await getAppServices();
    return await services.useCases.getPublicSettings.execute();
  } catch {
    return fallbackSettings;
  }
}

export async function getFeaturedWorks(): Promise<readonly Work[]> {
  try {
    const services = await getAppServices();
    return await services.useCases.getFeaturedWorks.execute();
  } catch {
    return [];
  }
}