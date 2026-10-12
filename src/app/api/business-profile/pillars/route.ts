import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toBusinessContext } from "@/lib/types";
import { generateContentPillars } from "@/lib/ai/generators";

export async function POST() {
  const profile = await prisma.businessProfile.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!profile) {
    return NextResponse.json({ error: "Create a business profile first." }, { status: 400 });
  }
  const ctx = toBusinessContext(profile);
  const pillars = await generateContentPillars(ctx);
  await prisma.businessProfile.update({
    where: { id: profile.id },
    data: { contentPillars: JSON.stringify(pillars) },
  });
  return NextResponse.json({ pillars });
}
