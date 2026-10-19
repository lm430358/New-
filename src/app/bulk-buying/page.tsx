import { TopBar } from "@/components/TopBar";
import { BulkBuyingCalculator } from "@/components/BulkBuyingCalculator";

export default function BulkBuyingPage() {
  return (
    <div>
      <TopBar title="Find Bulk Parts Opportunities" subtitle="Bulk inventory, overstock, closeout, and distributor programs — with the math to check if a lot actually makes sense." />
      <div className="p-6">
        <BulkBuyingCalculator />
      </div>
    </div>
  );
}
