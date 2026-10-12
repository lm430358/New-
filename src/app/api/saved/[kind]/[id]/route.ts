import { NextResponse } from "next/server";
import { deleteSaved, getSaved, isSavedKind } from "@/lib/saved";

export async function GET(_req: Request, ctx: RouteContext<"/api/saved/[kind]/[id]">) {
  const { kind, id } = await ctx.params;
  if (!isSavedKind(kind)) return NextResponse.json({ error: "Unknown kind" }, { status: 404 });

  const item = await getSaved(kind, id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/saved/[kind]/[id]">) {
  const { kind, id } = await ctx.params;
  if (!isSavedKind(kind)) return NextResponse.json({ error: "Unknown kind" }, { status: 404 });

  const deleted = await deleteSaved(kind, id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
