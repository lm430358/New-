import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveBusinessContext } from "@/lib/business";
import { generateSalesContent } from "@/lib/ai/generators";
import { withAutoScore } from "@/lib/ai/autoScore";
import { salesContentToText } from "@/lib/format";

const bodySchema = z.object({
  offerName: z.string().min(1),
  price: z.string().optional(),
  goal: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ctx = await getActiveBusinessContext();
  try {
    const sales = await generateSalesContent(ctx, parsed.data);
    const result = await withAutoScore(ctx, sales, salesContentToText, { contentType: "sales_copy" });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
