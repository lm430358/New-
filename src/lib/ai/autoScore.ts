import { scoreContent } from "./quality";
import type { BusinessContext } from "@/lib/types";

/**
 * Generates the text representation of a piece of content and immediately
 * runs it through the quality checker, so single-piece tools can return
 * `{ content, text, quality }` in one round trip (spec #15: "before
 * displaying finished content, automatically check...").
 */
export async function withAutoScore<T>(
  ctx: BusinessContext,
  content: T,
  toText: (c: T) => string,
  meta: { platform?: string; contentType: string }
) {
  const text = toText(content);
  const quality = await scoreContent(ctx, { content: text, platform: meta.platform, contentType: meta.contentType });
  return { content, text, quality };
}
