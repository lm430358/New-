import { z } from "zod";
import { addDays, format } from "date-fns";
import type { BusinessContext, ContentPillar } from "@/lib/types";
import { CONTENT_GOALS } from "@/lib/types";
import { generateStructured } from "../generate";
import { buildSystemPrompt } from "../context";
import { calendarSchema, type CalendarContent, type CalendarEntry } from "../schemas";

const DEFAULT_PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin", "email"];
const DEFAULT_PILLARS: ContentPillar[] = [
  { name: "Education", description: "Teach the audience something useful about the industry." },
  { name: "Trust & Credibility", description: "Show expertise, results, and reliability." },
  { name: "Behind the Scenes", description: "Show the real people and process behind the business." },
  { name: "Customer Stories", description: "Highlight real customer wins and experiences." },
  { name: "Promotion", description: "Direct offers, promotions, and calls to book/buy." },
];

interface DaySkeleton {
  day: number;
  date: string;
  platform: string;
  pillar: string;
  goal: string;
}

function buildSkeleton(ctx: BusinessContext, days: number, startDate: Date): DaySkeleton[] {
  const platforms = ctx.preferredPlatforms.length ? ctx.preferredPlatforms : DEFAULT_PLATFORMS;
  const pillars = ctx.contentPillars.length ? ctx.contentPillars : DEFAULT_PILLARS;
  const goals = ctx.goals.length ? ctx.goals : [...CONTENT_GOALS];

  const skeleton: DaySkeleton[] = [];
  for (let i = 0; i < days; i++) {
    skeleton.push({
      day: i + 1,
      date: format(addDays(startDate, i), "yyyy-MM-dd"),
      platform: platforms[i % platforms.length],
      pillar: pillars[(i + Math.floor(i / platforms.length)) % pillars.length].name,
      goal: goals[i % goals.length],
    });
  }
  return skeleton;
}

const chunkFillSchema = z.object({
  entries: z.array(
    z.object({
      day: z.number(),
      topic: z.string(),
      hook: z.string(),
      captionOrScript: z.string(),
      cta: z.string(),
      visualIdea: z.string(),
      hashtags: z.array(z.string()),
    })
  ),
});

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function fillChunk(ctx: BusinessContext, chunk: DaySkeleton[]): Promise<CalendarEntry[]> {
  const system = buildSystemPrompt(
    ctx,
    `You are filling in ${chunk.length} days of a content calendar. For EACH day below, using its assigned platform, content pillar, and goal, invent a specific, non-generic topic, a real hook line, the actual caption or short script (adapted to that day's platform's style), a CTA matching the goal, a concrete visual idea, and relevant hashtags (empty array if the platform doesn't suit them). No two days should feel similar even if they share a pillar or platform — vary the angle each time.`
  );
  const prompt = chunk
    .map(
      (d) =>
        `DAY ${d.day} (${d.date}) — Platform: ${d.platform} | Pillar: ${d.pillar} | Goal: ${d.goal}`
    )
    .join("\n");

  const result = await generateStructured({
    system,
    prompt,
    schema: chunkFillSchema,
    effort: "medium",
    maxTokens: Math.max(3000, chunk.length * 500),
  });

  const byDay = new Map(result.entries.map((e) => [e.day, e]));
  return chunk.map((d) => {
    const filled = byDay.get(d.day);
    return {
      day: d.day,
      date: d.date,
      platform: d.platform,
      pillar: d.pillar,
      goal: d.goal,
      contentType: contentTypeForPlatform(d.platform),
      topic: filled?.topic ?? "",
      hook: filled?.hook ?? "",
      captionOrScript: filled?.captionOrScript ?? "",
      cta: filled?.cta ?? "",
      visualIdea: filled?.visualIdea ?? "",
      hashtags: filled?.hashtags ?? [],
    };
  });
}

function contentTypeForPlatform(platform: string): string {
  switch (platform) {
    case "tiktok":
    case "youtube":
      return "Short-form video";
    case "instagram":
      return "Post / Reel";
    case "email":
      return "Email";
    case "blog":
      return "Blog post";
    case "linkedin":
      return "Post";
    default:
      return "Social post";
  }
}

/**
 * Generates a full content calendar. Days are assigned a platform/pillar/
 * goal deterministically (rotating through the business's pillars so no
 * pillar repeats back-to-back), then filled in by Claude in bounded chunks
 * run in parallel — this keeps every response small enough to avoid
 * truncation even at 90 days, and guarantees pillar/platform variety
 * mechanically rather than hoping the model self-diversifies.
 */
export async function generateCalendar(
  ctx: BusinessContext,
  params: { days: number; startDate?: Date; title?: string }
): Promise<CalendarContent> {
  const startDate = params.startDate ?? new Date();
  const skeleton = buildSkeleton(ctx, params.days, startDate);
  const chunks = chunkArray(skeleton, 10);

  const filledChunks = await Promise.all(chunks.map((chunk) => fillChunk(ctx, chunk)));
  const entries = filledChunks.flat().sort((a, b) => a.day - b.day);

  const assembled: CalendarContent = {
    title: params.title ?? `${params.days}-Day Content Calendar`,
    entries,
  };
  return calendarSchema.parse(assembled);
}
