import { TopBar } from "@/components/TopBar";
import { PartSearchForm } from "@/components/PartSearchForm";

export default function PartSearchPage() {
  return (
    <div>
      <TopBar title="Part Search & VIN Lookup" subtitle="Identify the right part category from vehicle details, symptoms, or part numbers." />
      <div className="p-6">
        <PartSearchForm />
      </div>
    </div>
  );
}
