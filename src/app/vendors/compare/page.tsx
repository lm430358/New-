import { TopBar } from "@/components/TopBar";
import { VendorCompare } from "@/components/vendors/VendorCompare";

export default function CompareVendorsPage() {
  return (
    <div>
      <TopBar title="Compare Vendors" subtitle="Pick vendors from your database to compare side by side." />
      <div className="p-6">
        <VendorCompare />
      </div>
    </div>
  );
}
