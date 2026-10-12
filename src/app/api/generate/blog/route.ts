import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveBusinessContext } from "@/lib/business";
import { generateBlogPost } from "@/lib/ai/generators";
import { withAutoScore } from "@/lib/ai/autoScore";
import { blogPostToText } from "@/lib/format";
import { aiErrorResponse } from "@/lib/ai/errors";

const bodySchema = z.object({ topic: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ctx = await getActiveBusinessContext();
  try {
    const blog = await generateBlogPost(ctx, parsed.data);
    const result = await withAutoScore(ctx, blog, blogPostToText, { platform: "blog", contentType: "blog_post" });
    return NextResponse.json(result);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
