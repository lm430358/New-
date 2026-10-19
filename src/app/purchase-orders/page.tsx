import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  draft: "neutral",
  sent: "info",
  received: "success",
  cancelled: "danger",
};

export default async function PurchaseOrdersPage() {
  const pos = await prisma.purchaseOrder.findMany({
    include: { vendor: true, lineItems: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <TopBar title="Purchase Orders" subtitle="Build, track, and export purchase orders for your vendors." />
      <div className="p-6 space-y-4 max-w-5xl">
        <div className="flex justify-end">
          <Link href="/purchase-orders/new"><Button>+ New purchase order</Button></Link>
        </div>
        {pos.length === 0 ? (
          <Card><CardBody className="text-sm text-[var(--text-muted)]">No purchase orders yet.</CardBody></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pos.map((po) => {
              const total = po.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0) * (1 + po.taxRate / 100) + po.shippingCost;
              return (
                <Link key={po.id} href={`/purchase-orders/${po.id}`}>
                  <Card className="hover:border-[var(--brand)]">
                    <CardBody className="space-y-1.5">
                      <div className="flex justify-between">
                        <p className="font-semibold text-sm">{po.poNumber}</p>
                        <Badge tone={statusTone[po.status]}>{po.status}</Badge>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{po.vendor?.name ?? "No vendor selected"} · {formatDate(po.date)}</p>
                      <p className="text-sm font-medium">{formatCurrency(total)} · {po.lineItems.length} line item(s)</p>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
