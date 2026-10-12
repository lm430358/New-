import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { businessProfileInputSchema } from "@/lib/validation";
import { getActiveBusinessProfile, setActiveBusinessProfile } from "@/lib/business";

export async function GET() {
  const profile = await getActiveBusinessProfile();
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = businessProfileInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const payload = {
    businessName: data.businessName,
    industry: data.industry,
    productsServices: data.productsServices,
    targetAudience: data.targetAudience,
    brandVoice: data.brandVoice,
    customVoiceName: data.customVoiceName || null,
    customVoiceNotes: data.customVoiceNotes || null,
    voiceSamples: JSON.stringify(data.voiceSamples ?? []),
    location: data.location || null,
    website: data.website || null,
    socialAccounts: JSON.stringify(data.socialAccounts ?? {}),
    brandDescription: data.brandDescription || null,
    usp: data.usp || null,
    pricingInfo: data.pricingInfo || null,
    currentPromotions: data.currentPromotions || null,
    goals: JSON.stringify(data.goals ?? []),
    competitors: JSON.stringify(data.competitors ?? []),
    preferredPlatforms: JSON.stringify(data.preferredPlatforms ?? []),
  };

  // A stale id (e.g. from another tab after a reset) falls back to creating a new profile.
  const existing = data.id
    ? await prisma.businessProfile.findUnique({ where: { id: data.id }, select: { id: true } })
    : null;
  const profile = existing
    ? await prisma.businessProfile.update({ where: { id: existing.id }, data: payload })
    : await prisma.businessProfile.create({ data: payload });

  await setActiveBusinessProfile(profile.id);

  return NextResponse.json({ profile });
}
