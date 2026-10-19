import { TopBar } from "@/components/TopBar";
import { WholesaleFinder } from "@/components/vendors/WholesaleFinder";

export default function WholesalePage() {
  return (
    <div>
      <TopBar title="Find Wholesale Car Parts Vendors" subtitle="Trade accounts, dealer accounts, reseller accounts, and bulk/fleet pricing — clearly split by verification status." />
      <div className="p-6">
        <WholesaleFinder />
      </div>
    </div>
  );
}
