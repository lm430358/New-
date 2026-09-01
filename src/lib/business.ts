import { prisma } from "@/lib/prisma";
import { toBusinessContext, type BusinessContext } from "@/lib/types";
import type { BusinessProfile } from "@prisma/client";

export async function getActiveBusinessProfile(): Promise<BusinessProfile | null> {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  if (settings?.activeBusinessProfileId) {
    const profile = await prisma.businessProfile.findUnique({
      where: { id: settings.activeBusinessProfileId },
    });
    if (profile) return profile;
  }
  return prisma.businessProfile.findFirst({ orderBy: { updatedAt: "desc" } });
}

export async function setActiveBusinessProfile(id: string): Promise<void> {
  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", activeBusinessProfileId: id },
    update: { activeBusinessProfileId: id },
  });
}

export async function getActiveBusinessContext(): Promise<BusinessContext> {
  const profile = await getActiveBusinessProfile();
  return toBusinessContext(profile);
}
