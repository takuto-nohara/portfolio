import type { Category, PublicSettings, Work } from "@/domain/publicApi";

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

export async function getWorks(category?: Category | null): Promise<readonly Work[]> {
  try {
    const services = await getAppServices();
    return await services.useCases.getWorkList.execute(category ?? null);
  } catch {
    return [];
  }
}

export async function getWorkDetail(id: number): Promise<Work | null> {
  try {
    const services = await getAppServices();
    return await services.useCases.getWorkDetail.execute(id);
  } catch {
    return null;
  }
}