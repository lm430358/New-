import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveBusinessContext } from "@/lib/business";
import { generateSocialPost } from "@/lib/ai/generators";
import { withAutoScore } from "@/lib/ai/autoScore";
import { socialPostToText } from "@/lib/format";
import { aiErrorResponse } from "@/lib/ai/errors";

const bodySchema = z.object({
  platform: z.string().min(1),
  topic: z.string().min(1),
  goal: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ctx = await getActiveBusinessContext();
  try {
    const post = await generateSocialPost(ctx, parsed.data);
    const result = await withAutoScore(ctx, post, socialPostToText, {
      platform: parsed.data.platform,
      contentType: "social_post",
    });
    return NextResponse.json(result);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
