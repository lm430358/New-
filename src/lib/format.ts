import type {
  SocialPost,
  CarouselContent,
  VideoScript,
  HookSet,
  EmailContent,
  BlogPost,
  WebsiteCopyBundle,
  SalesContent,
  LeadMagnetContent,
} from "@/lib/ai/schemas";

export function socialPostToText(post: SocialPost): string {
  const parts = [post.hook, "", post.body];
  if (post.hashtags.length) parts.push("", post.hashtags.map((h) => `#${h}`).join(" "));
  parts.push("", `CTA: ${post.cta}`);
  return parts.join("\n");
}

export function carouselToText(c: CarouselContent): string {
  const slides = c.slides.map((s) => `Slide ${s.slideNumber}: ${s.headline}\n${s.body}`).join("\n\n");
  return [c.title, "", slides, "", `Caption: ${c.caption}`, c.hashtags.map((h) => `#${h}`).join(" ")].join("\n");
}

export function videoScriptToText(v: VideoScript): string {
  const sections = v.script
    .map(
      (s) =>
        `[${s.section}]\nVoiceover: ${s.voiceover}\nOn-screen text: ${s.onScreenText}\nB-roll: ${s.bRoll}\nCamera: ${s.cameraDirection}`
    )
    .join("\n\n");
  return [
    `${v.title} (${v.length})`,
    "",
    `HOOK: ${v.hook}`,
    "",
    sections,
    "",
    `CTA: ${v.cta}`,
    "",
    `Caption: ${v.caption}`,
    v.hashtags.map((h) => `#${h}`).join(" "),
  ].join("\n");
}

export function hookSetToText(h: HookSet): string {
  return h.hooks.map((hook, i) => `${i + 1}. [${hook.style}] ${hook.text}`).join("\n");
}

export function emailToText(e: EmailContent): string {
  return [
    `Subject options: ${e.subjectLines.join(" | ")}`,
    `Preheader: ${e.preheader}`,
    "",
    e.body,
    "",
    `CTA: ${e.cta}`,
  ].join("\n");
}

export function blogPostToText(b: BlogPost): string {
  return [b.title, "", b.body, "", `CTA: ${b.cta}`].join("\n");
}

export function websiteCopyToText(w: WebsiteCopyBundle): string {
  const services = w.serviceDescriptions.map((s) => `${s.name}: ${s.description}`).join("\n");
  const faqs = w.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
  return [
    `HERO\n${w.homepageHero.headline}\n${w.homepageHero.subheadline}\nCTA: ${w.homepageHero.cta}`,
    `\nABOUT\n${w.aboutSection}`,
    `\nSERVICES\n${services}`,
    `\nFAQS\n${faqs}`,
  ].join("\n");
}

export function salesContentToText(s: SalesContent): string {
  const ads = s.advertisements.map((a) => `${a.headline}\n${a.primaryText}\nCTA: ${a.cta}`).join("\n\n");
  return [
    `SALES PAGE\n${s.salesPage.headline}\n${s.salesPage.subheadline}\n\n${s.salesPage.body}\n\nCTA: ${s.salesPage.cta}`,
    `\nPRODUCT DESCRIPTION\n${s.productDescription}`,
    `\nADS\n${ads}`,
    `\nOFFERS\n${s.offers.join("\n")}`,
  ].join("\n");
}

export function leadMagnetToText(l: LeadMagnetContent): string {
  return [`${l.title}`, l.subtitle, "", l.content, "", `CTA: ${l.cta}`].join("\n");
}

/**
 * Best-effort text flattening for arbitrary saved Content Library bodies —
 * duck-types the common shapes so the library can render a readable preview
 * (and a copy/export string) without needing to know each item's exact type.
 */
export function flattenLibraryBody(body: unknown): string {
  if (body == null) return "";
  if (typeof body === "string") return body;
  if (typeof body !== "object") return String(body);
  const b = body as Record<string, unknown>;

  if (typeof b.text === "string") return b.text;
  if (typeof b.improved === "string") return b.improved;
  if (Array.isArray(b.entries)) return `${b.entries.length}-day content calendar: ${String(b.title ?? "")}`;
  if (b.salesPage) return salesContentToText(body as SalesContent);
  if (b.homepageHero) return websiteCopyToText(body as WebsiteCopyBundle);
  if (Array.isArray(b.promotionalPosts) && typeof b.content === "string") return leadMagnetToText(body as LeadMagnetContent);
  if (typeof b.metaDescription === "string") return blogPostToText(body as BlogPost);
  if (Array.isArray(b.subjectLines)) return emailToText(body as EmailContent);
  if (Array.isArray(b.slides)) return carouselToText(body as CarouselContent);
  if (Array.isArray(b.script)) return videoScriptToText(body as VideoScript);
  if (Array.isArray(b.hooks)) return hookSetToText(body as HookSet);
  if (typeof b.hook === "string" && typeof b.body === "string" && Array.isArray(b.hashtags))
    return socialPostToText(body as SocialPost);

  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return String(body);
  }
}

export function qualityReportSummary(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good — minor improvements suggested";
  return "Needs work before publishing";
}
