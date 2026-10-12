import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveBusinessContext } from "@/lib/business";
import { generateRepurposeOutput } from "@/lib/ai/generators";

const bodySchema = z.object({ sourceContent: z.string().min(20, "Paste at least a few sentences of source content") });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ctx = await getActiveBusinessContext();
  try {
    const output = await generateRepurposeOutput(ctx, parsed.data.sourceContent);
    return NextResponse.json({ output });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
