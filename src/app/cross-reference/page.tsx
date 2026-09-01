import { TopBar } from "@/components/TopBar";
import { CrossReferenceTool } from "@/components/CrossReferenceTool";

export default function CrossReferencePage() {
  return (
    <div>
      <TopBar title="Find Equivalent Parts" subtitle="Cross-reference OEM and aftermarket part numbers you've confirmed — never a fabricated match." />
      <div className="p-6">
        <CrossReferenceTool />
      </div>
    </div>
  );
}
