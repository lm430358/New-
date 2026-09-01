import { TopBar } from "@/components/TopBar";
import { ResellOpportunitiesView } from "@/components/ResellOpportunitiesView";

export default function ResellOpportunitiesPage() {
  return (
    <div>
      <TopBar title="Find Parts I Can Resell" subtitle="Directional, labeled estimates — never a guarantee of profitability." />
      <div className="p-6">
        <ResellOpportunitiesView />
      </div>
    </div>
  );
}
