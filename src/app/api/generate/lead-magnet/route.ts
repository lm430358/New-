import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessContext, getActiveBusinessProfile } from "@/lib/business";
import { generateLeadMagnet } from "@/lib/ai/generators";
import { withAutoScore } from "@/lib/ai/autoScore";
import { leadMagnetToText } from "@/lib/format";

const bodySchema = z.object({ format: z.string().min(1), topic: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ctx = await getActiveBusinessContext();
  try {
    const leadMagnet = await generateLeadMagnet(ctx, parsed.data);
    const result = await withAutoScore(ctx, leadMagnet, leadMagnetToText, { contentType: "lead_magnet" });

    const profile = await getActiveBusinessProfile();
    await prisma.leadMagnet.create({
      data: {
        businessProfileId: profile?.id,
        format: parsed.data.format,
        title: leadMagnet.title,
        content: JSON.stringify(leadMagnet),
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
