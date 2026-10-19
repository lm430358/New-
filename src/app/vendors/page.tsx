import { TopBar } from "@/components/TopBar";
import { VendorList } from "@/components/vendors/VendorList";

export default function VendorsPage() {
  return (
    <div>
      <TopBar title="Vendor Database" subtitle="Vendors you've researched and are tracking, plus a starting reference list of well-known suppliers." />
      <div className="p-6">
        <VendorList />
      </div>
    </div>
  );
}
