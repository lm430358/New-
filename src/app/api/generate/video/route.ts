import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveBusinessContext } from "@/lib/business";
import { generateVideoScript } from "@/lib/ai/generators";
import { withAutoScore } from "@/lib/ai/autoScore";
import { videoScriptToText } from "@/lib/format";

const bodySchema = z.object({
  topic: z.string().min(1),
  platform: z.string().optional(),
  lengthLabel: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ctx = await getActiveBusinessContext();
  try {
    const script = await generateVideoScript(ctx, parsed.data);
    const result = await withAutoScore(ctx, script, videoScriptToText, {
      platform: parsed.data.platform,
      contentType: "video_script",
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
