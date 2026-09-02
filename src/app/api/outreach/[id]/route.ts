import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Approval-gate endpoint: PATCH { action: "approve" | "mark_sent" }.
// There is no "send" action here on purpose — this app never contacts
// anyone on its own. Approving just marks a draft ready to be copied out.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action } = await req.json();

  if (action === "approve") {
    const message = await prisma.outreachMessage.update({
      where: { id },
      data: { status: "approved", approvedAt: new Date() },
    });
    return NextResponse.json({ message });
  }

  if (action === "mark_sent") {
    const message = await prisma.outreachMessage.update({
      where: { id },
      data: { status: "marked_sent", markedSentAt: new Date() },
    });
    await prisma.lead.update({
      where: { id: message.leadId },
      data: { lastContact: new Date(), stage: "contacted", outreachStatus: "contacted" },
    });
    return NextResponse.json({ message });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
