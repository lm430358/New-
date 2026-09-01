import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessProfile } from "@/lib/business";

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const profile = await getActiveBusinessProfile();
  const conversation = await prisma.conversation.create({
    data: { businessProfileId: profile?.id, title: body.title || "New conversation" },
  });
  return NextResponse.json({ conversation });
}
