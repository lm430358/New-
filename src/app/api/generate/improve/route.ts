import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveBusinessContext } from "@/lib/business";
import { improveContent } from "@/lib/ai/generators";
import { withAutoScore } from "@/lib/ai/autoScore";

const bodySchema = z.object({
  content: z.string().min(1),
  action: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ctx = await getActiveBusinessContext();
  try {
    const improved = await improveContent(ctx, parsed.data);
    const result = await withAutoScore(ctx, improved, (c) => c.improved, {
      contentType: "improved_content",
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
