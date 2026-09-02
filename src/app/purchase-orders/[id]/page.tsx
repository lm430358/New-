import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { computePoTotals } from "@/lib/pdf";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PurchaseOrderActions } from "@/components/PurchaseOrderActions";

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { lineItems: { orderBy: { sortOrder: "asc" } }, vendor: true },
  });
  if (!po) notFound();
  const { subtotal, tax, total } = computePoTotals(po);

  return (
    <div>
      <TopBar title={po.poNumber} subtitle={po.vendor?.name ?? "No vendor selected"} />
      <div className="p-6 space-y-6 max-w-4xl">
        <PurchaseOrderActions po={po} />

        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-2 gap-3 text-sm">
            <p><span className="text-[var(--text-muted)]">Date:</span> {formatDate(po.date)}</p>
            <p><span className="text-[var(--text-muted)]">Status:</span> {po.status}</p>
            <p><span className="text-[var(--text-muted)]">Tax rate:</span> {po.taxRate}%</p>
            <p><span className="text-[var(--text-muted)]">Shipping:</span> {formatCurrency(po.shippingCost)}</p>
            {po.notes && <p className="col-span-2"><span className="text-[var(--text-muted)]">Notes:</span> {po.notes}</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Line items</CardTitle></CardHeader>
          <CardBody className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                  <th className="py-2 pr-4">Part #</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">Unit Price</th>
                  <th className="py-2 pr-4">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {po.lineItems.map((li) => (
                  <tr key={li.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-4">{li.partNumber ?? "—"}</td>
                    <td className="py-2 pr-4">{li.description}</td>
                    <td className="py-2 pr-4">{li.quantity}</td>
                    <td className="py-2 pr-4">{formatCurrency(li.unitPrice)}</td>
                    <td className="py-2 pr-4 font-medium">{formatCurrency(li.quantity * li.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <div className="text-sm text-right space-y-1">
                <p>Subtotal: <span className="font-medium">{formatCurrency(subtotal)}</span></p>
                <p>Tax: <span className="font-medium">{formatCurrency(tax)}</span></p>
                <p>Shipping: <span className="font-medium">{formatCurrency(po.shippingCost)}</span></p>
                <p className="text-base font-semibold">Total: {formatCurrency(total)}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
