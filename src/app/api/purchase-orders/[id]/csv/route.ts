import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computePoTotals } from "@/lib/pdf";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { lineItems: { orderBy: { sortOrder: "asc" } }, vendor: true },
  });
  if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { subtotal, tax, total } = computePoTotals(po);
  const rows = [
    ["PO Number", po.poNumber],
    ["Vendor", po.vendor?.name ?? ""],
    ["Date", po.date.toISOString().slice(0, 10)],
    ["Status", po.status],
    [],
    ["Part Number", "Description", "Quantity", "Unit Price", "Line Total"],
    ...po.lineItems.map((li) => [
      li.partNumber ?? "",
      li.description,
      String(li.quantity),
      li.unitPrice.toFixed(2),
      (li.quantity * li.unitPrice).toFixed(2),
    ]),
    [],
    ["Subtotal", subtotal.toFixed(2)],
    [`Tax (${po.taxRate}%)`, tax.toFixed(2)],
    ["Shipping", po.shippingCost.toFixed(2)],
    ["Total", total.toFixed(2)],
  ];

  const csv = rows.map((r) => r.map((c) => csvEscape(String(c))).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${po.poNumber}.csv"`,
    },
  });
}
