import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveBusinessContext } from "@/lib/business";
import { generateCarousel } from "@/lib/ai/generators";
import { withAutoScore } from "@/lib/ai/autoScore";
import { carouselToText } from "@/lib/format";

const bodySchema = z.object({ topic: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ctx = await getActiveBusinessContext();
  try {
    const carousel = await generateCarousel(ctx, parsed.data);
    const result = await withAutoScore(ctx, carousel, carouselToText, {
      platform: "instagram",
      contentType: "carousel",
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
