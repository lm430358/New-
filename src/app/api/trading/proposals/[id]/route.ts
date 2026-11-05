import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tradingEnv } from "@/lib/trading/config";
import { decide } from "@/lib/trading/engine";

/** Approval links carry a per-proposal secret token, so they work from a phone without the admin password. */
async function authorized(id: string, token: string | null) {
  const p = await prisma.tradeProposal.findUnique({ where: { id } });
  if (!p || !token) return null;
  const a = Buffer.from(p.token);
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? p : null;
}

export async function GET(request: Request, ctx: RouteContext<"/api/trading/proposals/[id]">) {
  const { id } = await ctx.params;
  const p = await authorized(id, new URL(request.url).searchParams.get("t"));
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { token: _token, ...proposal } = p;
  void _token;
  return NextResponse.json({ proposal, mode: tradingEnv().mode });
}

const body = z.object({ token: z.string(), decision: z.enum(["yes", "no"]) });

export async function POST(request: Request, ctx: RouteContext<"/api/trading/proposals/[id]">) {
  const { id } = await ctx.params;
  const parsed = body.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const p = await authorized(id, parsed.data.token);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const result = await decide(id, parsed.data.decision, "web");
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
