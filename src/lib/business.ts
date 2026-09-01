import { prisma } from "@/lib/prisma";

/** Returns the active BusinessProfile, if one has been set up. */
export async function getActiveBusinessProfile() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  if (!settings?.activeBusinessProfileId) {
    // Fall back to the most recently updated profile so single-workspace
    // installs "just work" without an explicit activation step.
    return prisma.businessProfile.findFirst({ orderBy: { updatedAt: "desc" } });
  }
  return prisma.businessProfile.findUnique({ where: { id: settings.activeBusinessProfileId } });
}

export async function setActiveBusinessProfile(id: string) {
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: { activeBusinessProfileId: id },
    create: { id: "singleton", activeBusinessProfileId: id },
  });
}
