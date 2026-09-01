import { TopBar } from "@/components/TopBar";
import { CommandCenter } from "@/components/CommandCenter";

export default function CommandCenterPage() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar title="AI Command Center" subtitle='Try: "find me three vendors", "compare these vendors", "calculate my profit", "create a purchase order".' />
      <div className="flex-1 min-h-0">
        <CommandCenter />
      </div>
    </div>
  );
}
