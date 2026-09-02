import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  if (!["approved", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "status must be approved or dismissed" }, { status: 400 });
  }
  const task = await prisma.task.update({ where: { id }, data: { status, resolvedAt: new Date() } });
  return NextResponse.json({ task });
}
