import { prisma } from "@/lib/prisma";

/**
 * Calendars, campaigns, and lead magnets are persisted automatically when they're
 * generated. This module is the one place that knows how to list, load, and
 * delete them, so the `/api/saved/[kind]` routes stay generic.
 */
export const SAVED_KINDS = ["calendars", "campaigns", "lead-magnets"] as const;
export type SavedKind = (typeof SAVED_KINDS)[number];

export interface SavedSummary {
  id: string;
  title: string;
  createdAt: Date;
  detail: string;
}

export function isSavedKind(kind: string): kind is SavedKind {
  return (SAVED_KINDS as readonly string[]).includes(kind);
}

function scope(businessProfileId?: string | null) {
  return businessProfileId ? { businessProfileId } : {};
}

export async function listSaved(kind: SavedKind, businessProfileId?: string | null): Promise<SavedSummary[]> {
  const where = scope(businessProfileId);
  const orderBy = { createdAt: "desc" as const };
  const take = 50;

  switch (kind) {
    case "calendars": {
      const rows = await prisma.contentCalendar.findMany({
        where,
        orderBy,
        take,
        select: { id: true, title: true, createdAt: true, days: true, startDate: true },
      });
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        createdAt: r.createdAt,
        detail: `${r.days} days from ${r.startDate.toISOString().slice(0, 10)}`,
      }));
    }
    case "campaigns": {
      const rows = await prisma.campaign.findMany({
        where,
        orderBy,
        take,
        select: { id: true, title: true, createdAt: true, input: true },
      });
      return rows.map((r) => {
        const input = safeParse<{ lengthDays?: number; goal?: string }>(r.input) ?? {};
        return {
          id: r.id,
          title: r.title,
          createdAt: r.createdAt,
          detail: [input.lengthDays ? `${input.lengthDays}-day campaign` : null, input.goal].filter(Boolean).join(" · "),
        };
      });
    }
    case "lead-magnets": {
      const rows = await prisma.leadMagnet.findMany({
        where,
        orderBy,
        take,
        select: { id: true, title: true, createdAt: true, format: true },
      });
      return rows.map((r) => ({ id: r.id, title: r.title, createdAt: r.createdAt, detail: r.format.replace(/_/g, " ") }));
    }
  }
}

export async function getSaved(kind: SavedKind, id: string) {
  switch (kind) {
    case "calendars": {
      const row = await prisma.contentCalendar.findUnique({ where: { id } });
      if (!row) return null;
      return {
        id: row.id,
        startDate: row.startDate,
        days: row.days,
        calendar: { title: row.title, entries: safeParse<unknown[]>(row.entries) ?? [] },
      };
    }
    case "campaigns": {
      const row = await prisma.campaign.findUnique({ where: { id } });
      if (!row) return null;
      return { id: row.id, input: safeParse(row.input), campaign: safeParse(row.strategy) };
    }
    case "lead-magnets": {
      const row = await prisma.leadMagnet.findUnique({ where: { id } });
      if (!row) return null;
      return { id: row.id, format: row.format, content: safeParse(row.content) };
    }
  }
}

export async function deleteSaved(kind: SavedKind, id: string): Promise<boolean> {
  const where = { id };
  switch (kind) {
    case "calendars":
      return (await prisma.contentCalendar.deleteMany({ where })).count > 0;
    case "campaigns":
      return (await prisma.campaign.deleteMany({ where })).count > 0;
    case "lead-magnets":
      return (await prisma.leadMagnet.deleteMany({ where })).count > 0;
  }
}

function safeParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
