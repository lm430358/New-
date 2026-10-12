import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessContext, getActiveBusinessProfile } from "@/lib/business";
import { generateCalendar } from "@/lib/ai/generators";

const bodySchema = z.object({
  days: z.number().int().positive().max(90),
  startDate: z.string().optional(),
  title: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ctx = await getActiveBusinessContext();
  try {
    const startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : new Date();
    const calendar = await generateCalendar(ctx, { ...parsed.data, startDate });

    const profile = await getActiveBusinessProfile();
    const saved = await prisma.contentCalendar.create({
      data: {
        businessProfileId: profile?.id,
        title: calendar.title,
        days: parsed.data.days,
        startDate,
        entries: JSON.stringify(calendar.entries),
      },
    });

    return NextResponse.json({ calendar, id: saved.id });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
