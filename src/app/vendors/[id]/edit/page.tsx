import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { VendorForm } from "@/components/vendors/VendorForm";
import { prisma } from "@/lib/prisma";

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) notFound();
  return (
    <div>
      <TopBar title={`Edit ${vendor.name}`} />
      <div className="p-6">
        <VendorForm vendor={vendor} />
      </div>
    </div>
  );
}
