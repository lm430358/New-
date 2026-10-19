import { TopBar } from "@/components/TopBar";
import { RepairEstimateCalculator } from "@/components/RepairEstimateCalculator";

export default function RepairEstimatePage() {
  return (
    <div>
      <TopBar
        title="Repair Job Price Estimator"
        subtitle="Labor, travel, and job-specific surcharges — fully itemized, with every rate editable."
      />
      <div className="p-6">
        <RepairEstimateCalculator />
      </div>
    </div>
  );
}
