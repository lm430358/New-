import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePurchaseOrderPdf } from "@/lib/pdf";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { lineItems: { orderBy: { sortOrder: "asc" } }, vendor: true, businessProfile: true },
  });
  if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bytes = await generatePurchaseOrderPdf(po);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${po.poNumber}.pdf"`,
    },
  });
}
