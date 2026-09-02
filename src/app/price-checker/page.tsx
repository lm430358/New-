import { TopBar } from "@/components/TopBar";
import { PriceCheckerView } from "@/components/PriceCheckerView";

export default function PriceCheckerPage() {
  return (
    <div>
      <TopBar title="Compare Part Prices" subtitle="Every logged price check across all your vendors, side by side." />
      <div className="p-6">
        <PriceCheckerView />
      </div>
    </div>
  );
}
