import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessContext, getActiveBusinessProfile } from "@/lib/business";
import { generateCampaign } from "@/lib/ai/generators";

const bodySchema = z.object({
  productOrService: z.string().min(1),
  targetCustomer: z.string().min(1),
  offer: z.string().min(1),
  price: z.string().optional(),
  goal: z.string().min(1),
  lengthDays: z.number().int().positive().max(180),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ctx = await getActiveBusinessContext();
  try {
    const campaign = await generateCampaign(ctx, parsed.data);

    const profile = await getActiveBusinessProfile();
    const saved = await prisma.campaign.create({
      data: {
        businessProfileId: profile?.id,
        title: campaign.title,
        input: JSON.stringify(parsed.data),
        strategy: JSON.stringify(campaign),
      },
    });

    return NextResponse.json({ campaign, id: saved.id });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
