// The automated part of Phase 5/6's follow-up sequence: initial -> followup_1
// -> followup_2 -> followup_3, then stop (a cold lead beyond that needs a
// manual reactivation decision, not another automated nudge).
//
// Cadence is escalating gaps counted from the PREVIOUS message in the
// sequence, matching the stage descriptions in src/lib/ai/generators.ts
// (STAGE_BRIEF): ~3-4 days to followup_1, ~1 week to followup_2, ~2 weeks to
// followup_3.

export const FOLLOWUP_SEQUENCE = ["initial", "followup_1", "followup_2", "followup_3"] as const;

export const NEXT_STAGE: Record<string, string | null> = {
  initial: "followup_1",
  followup_1: "followup_2",
  followup_2: "followup_3",
  followup_3: null,
};

export const DELAY_DAYS_UNTIL_NEXT: Record<string, number> = {
  initial: 4,
  followup_1: 7,
  followup_2: 14,
};

export function nextFollowupStage(currentStage: string): string | null {
  return NEXT_STAGE[currentStage] ?? null;
}

/**
 * Given every marked_sent message on a lead, finds how far along the
 * initial -> followup_1 -> followup_2 -> followup_3 sequence it's gotten —
 * by sequence position, not by createdAt. Two messages can in principle
 * share a millisecond timestamp (or be entered out of order by an
 * operator), so "most recently created" is not a safe proxy for "furthest
 * along"; sequence position always is.
 */
export function furthestSentStage(
  messages: { stage: string; status: string; channel: string }[]
): { stage: string; channel: string } | null {
  let best: { stage: string; channel: string; rank: number } | null = null;
  for (const m of messages) {
    if (m.status !== "marked_sent") continue;
    const rank = FOLLOWUP_SEQUENCE.indexOf(m.stage as (typeof FOLLOWUP_SEQUENCE)[number]);
    if (rank === -1) continue; // not part of the auto-drip (e.g. reactivation, sales_followup)
    if (!best || rank > best.rank) best = { stage: m.stage, channel: m.channel, rank };
  }
  return best ? { stage: best.stage, channel: best.channel } : null;
}

export function computeNextFollowUpDate(currentStage: string, from: Date = new Date()): Date | null {
  const delay = DELAY_DAYS_UNTIL_NEXT[currentStage];
  if (delay === undefined) return null;
  const next = new Date(from);
  next.setDate(next.getDate() + delay);
  return next;
}
