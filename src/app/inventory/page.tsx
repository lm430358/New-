import { TopBar } from "@/components/TopBar";
import { InventoryView } from "@/components/InventoryView";

export default function InventoryPage() {
  return (
    <div>
      <TopBar title="Inventory" subtitle="Track parts on hand, cost, selling price, and reorder points." />
      <div className="p-6">
        <InventoryView />
      </div>
    </div>
  );
}
