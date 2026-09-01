import { TopBar } from "@/components/TopBar";
import { LocalFinder } from "@/components/vendors/LocalFinder";

export default function LocalPage() {
  return (
    <div>
      <TopBar title="Local Supplier Finder" subtitle='e.g. "Find wholesale auto-parts suppliers near Atlanta" — searches your own verified vendor database by city/state.' />
      <div className="p-6">
        <LocalFinder />
      </div>
    </div>
  );
}
