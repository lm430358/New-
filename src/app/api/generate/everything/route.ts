import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveBusinessContext } from "@/lib/business";
import { generateEverythingPackage } from "@/lib/ai/generators";

const bodySchema = z.object({ idea: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ctx = await getActiveBusinessContext();
  try {
    const pkg = await generateEverythingPackage(ctx, parsed.data.idea);
    return NextResponse.json({ package: pkg });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
