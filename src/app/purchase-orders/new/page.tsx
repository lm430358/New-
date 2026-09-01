import { TopBar } from "@/components/TopBar";
import { PurchaseOrderForm } from "@/components/PurchaseOrderForm";
import { prisma } from "@/lib/prisma";

export default async function NewPurchaseOrderPage() {
  const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <div>
      <TopBar title="New Purchase Order" />
      <div className="p-6">
        <PurchaseOrderForm vendors={vendors} />
      </div>
    </div>
  );
}
