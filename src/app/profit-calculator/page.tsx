import { TopBar } from "@/components/TopBar";
import { ProfitCalculator } from "@/components/ProfitCalculator";

export default function ProfitCalculatorPage() {
  return (
    <div>
      <TopBar title="Profit Calculator" subtitle="Total cost, gross profit, gross margin, and markup — clearly distinguished." />
      <div className="p-6">
        <ProfitCalculator />
      </div>
    </div>
  );
}
