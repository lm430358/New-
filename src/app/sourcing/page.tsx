import { TopBar } from "@/components/TopBar";
import { SmartSourcingView } from "@/components/SmartSourcingView";

export default function SourcingPage() {
  return (
    <div>
      <TopBar
        title="Smart Sourcing Agent"
        subtitle='e.g. "I need 20 sets of brake pads for 2018-2020 Toyota Camrys. Find me the best wholesale options."'
      />
      <div className="p-6">
        <SmartSourcingView />
      </div>
    </div>
  );
}
