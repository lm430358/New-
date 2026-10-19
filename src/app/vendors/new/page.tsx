import { TopBar } from "@/components/TopBar";
import { VendorForm } from "@/components/vendors/VendorForm";

export default function NewVendorPage() {
  return (
    <div>
      <TopBar title="Add Vendor" subtitle="Only record what you've actually confirmed — the sourcing score and scam checks rely on this being accurate." />
      <div className="p-6">
        <VendorForm />
      </div>
    </div>
  );
}
