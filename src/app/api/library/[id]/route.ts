import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, ctx: RouteContext<"/api/library/[id]">) {
  const { id } = await ctx.params;
  const item = await prisma.contentItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

const patchSchema = z.object({
  title: z.string().optional(),
  body: z.unknown().optional(),
  favorite: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(req: Request, ctx: RouteContext<"/api/library/[id]">) {
  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const item = await prisma.contentItem.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.body !== undefined ? { body: JSON.stringify(data.body) } : {}),
      ...(data.favorite !== undefined ? { favorite: data.favorite } : {}),
      ...(data.tags !== undefined ? { tags: JSON.stringify(data.tags) } : {}),
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/library/[id]">) {
  const { id } = await ctx.params;
  await prisma.contentItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
