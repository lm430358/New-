import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveBusinessContext } from "@/lib/business";
import { scoreContent } from "@/lib/ai/quality";

const bodySchema = z.object({
  content: z.string().min(1),
  platform: z.string().optional(),
  contentType: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const ctx = await getActiveBusinessContext();
  try {
    const report = await scoreContent(ctx, parsed.data);
    return NextResponse.json({ report });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
