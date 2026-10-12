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
  CalendarContent,
  RepurposeOutput,
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
export function calendarToText(c: CalendarContent): string {
  const days = c.entries.map((e) =>
    [
      `Day ${e.day} · ${e.date} · ${e.platform} · ${e.contentType}`,
      `Pillar: ${e.pillar} · Goal: ${e.goal}`,
      `Topic: ${e.topic}`,
      `Hook: ${e.hook}`,
      e.captionOrScript,
      `CTA: ${e.cta}`,
      `Visual: ${e.visualIdea}`,
      e.hashtags.length ? e.hashtags.map((h) => `#${h}`).join(" ") : "",
    ]
      .filter(Boolean)
      .join("\n")
  );
  return [c.title, ...days].join("\n\n---\n\n");
}

export function repurposeToText(r: RepurposeOutput): string {
  const section = (heading: string, body: string) => `== ${heading} ==\n\n${body}`;
  return [
    `Source summary: ${r.sourceSummary}`,
    section("Facebook post", socialPostToText(r.facebookPost)),
    section("LinkedIn post", socialPostToText(r.linkedinPost)),
    ...r.instagramCaptions.map((p, i) => section(`Instagram caption ${i + 1}`, socialPostToText(p))),
    section("TikTok ideas", r.tiktokIdeas.map((t, i) => `${i + 1}. ${t.concept}\n   Hook: ${t.hook}`).join("\n")),
    ...r.shortFormScripts.map((v, i) => section(`Short-form script ${i + 1}`, videoScriptToText(v))),
    section("Email", emailToText(r.email)),
    section("Blog post", blogPostToText(r.blogPost)),
    section("Carousel", carouselToText(r.carousel)),
    section("Hooks", hookSetToText(r.hooks)),
  ].join("\n\n");
}

export function flattenLibraryBody(body: unknown): string {
  if (body == null) return "";
  if (typeof body === "string") return body;
  if (typeof body !== "object") return String(body);
  const b = body as Record<string, unknown>;

  if (typeof b.text === "string") return b.text;
  if (typeof b.improved === "string") return b.improved;
  if (Array.isArray(b.entries)) return calendarToText(body as CalendarContent);
  if (typeof b.sourceSummary === "string" && b.facebookPost) return repurposeToText(body as RepurposeOutput);
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
