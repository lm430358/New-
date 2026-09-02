import { TopBar } from "@/components/TopBar";
import { BusinessProfileForm } from "@/components/BusinessProfileForm";
import { getActiveBusinessProfile } from "@/lib/business";
import { safeJsonParse } from "@/lib/utils";

export default async function BusinessProfilePage() {
  const profile = await getActiveBusinessProfile();
  const withLists = profile
    ? {
        ...profile,
        preferredSuppliersList: safeJsonParse<string[]>(profile.preferredSuppliers, []),
        preferredBrandsList: safeJsonParse<string[]>(profile.preferredBrands, []),
      }
    : null;

  return (
    <div>
      <TopBar title="Business Profile" subtitle="Set this up once — every tool in the app uses it automatically." />
      <div className="p-6">
        <BusinessProfileForm profile={withLists} />
      </div>
    </div>
  );
}
