import { NextResponse } from "next/server";
import { getActiveBusinessProfile } from "@/lib/business";
import { isSavedKind, listSaved } from "@/lib/saved";

export async function GET(_req: Request, ctx: RouteContext<"/api/saved/[kind]">) {
  const { kind } = await ctx.params;
  if (!isSavedKind(kind)) return NextResponse.json({ error: "Unknown kind" }, { status: 404 });

  const profile = await getActiveBusinessProfile();
  const items = await listSaved(kind, profile?.id);
  return NextResponse.json({ items });
}
