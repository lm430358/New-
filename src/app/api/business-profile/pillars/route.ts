import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toBusinessContext } from "@/lib/types";
import { getActiveBusinessProfile } from "@/lib/business";
import { generateContentPillars } from "@/lib/ai/generators";
import { aiErrorResponse } from "@/lib/ai/errors";

export async function POST() {
  const profile = await getActiveBusinessProfile();
  if (!profile) {
    return NextResponse.json({ error: "Create a business profile first." }, { status: 400 });
  }
  try {
    const pillars = await generateContentPillars(toBusinessContext(profile));
    await prisma.businessProfile.update({
      where: { id: profile.id },
      data: { contentPillars: JSON.stringify(pillars) },
    });
    return NextResponse.json({ pillars });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
