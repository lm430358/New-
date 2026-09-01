import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { computeSourcingScore } from "@/lib/sourcingScore";
import { detectScamFlags } from "@/lib/scamFlags";
import { VENDOR_TYPES } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { VendorQuickActions, PriceCheckPanel, ContactAssistantPanel } from "@/components/vendors/VendorDetailPanels";
import { AlertTriangle, Pencil } from "lucide-react";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      priceChecks: { orderBy: { checkedAt: "desc" } },
      contactMessages: { orderBy: { createdAt: "desc" } },
      crossReferences: true,
    },
  });
  if (!vendor) notFound();

  const score = computeSourcingScore({
    wholesaleStatus: vendor.wholesaleStatus,
    localVerified: vendor.localVerified,
    website: vendor.website,
    phone: vendor.phone,
    returnPolicy: vendor.returnPolicy,
    warrantyInfo: vendor.warrantyInfo,
    shippingInfo: vendor.shippingInfo,
    minimumOrder: vendor.minimumOrder,
    internalRating: vendor.internalRating,
    status: vendor.status,
    verificationDate: vendor.verificationDate,
    priceCheckCount: vendor.priceChecks.length,
    matchesPreferredSupplier: false,
    matchesPreferredBrand: false,
  });

  const flags = detectScamFlags({
    website: vendor.website,
    phone: vendor.phone,
    email: vendor.email,
    street: vendor.street,
    returnPolicy: vendor.returnPolicy,
    warrantyInfo: vendor.warrantyInfo,
    accountRequirements: vendor.accountRequirements,
    notes: vendor.notes,
    sourceType: vendor.sourceType,
  });

  const infoRows: [string, string | null][] = [
    ["Vendor type", VENDOR_TYPES.find((t) => t.value === vendor.vendorType)?.label ?? vendor.vendorType],
    ["Supply kind", vendor.supplyKind],
    ["Location", [vendor.street, vendor.city, vendor.state, vendor.zip].filter(Boolean).join(", ") || null],
    ["Website", vendor.website],
    ["Phone", vendor.phone],
    ["Email", vendor.email],
    ["Shipping", vendor.shippingInfo],
    ["Minimum order", vendor.minimumOrder],
    ["Wholesale requirements", vendor.wholesaleRequirements],
    ["Account requirements", vendor.accountRequirements],
    ["Return policy", vendor.returnPolicy],
    ["Warranty", vendor.warrantyInfo],
    ["Hours", vendor.hoursInfo],
    ["Verification date", vendor.verificationDate ? formatDate(vendor.verificationDate) : null],
  ];

  return (
    <div>
      <TopBar title={vendor.name} subtitle={vendor.notes ?? undefined} />
      <div className="p-6 space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={vendor.wholesaleStatus === "verified" ? "success" : "neutral"}>
              {vendor.wholesaleStatus === "verified" ? "Wholesale availability verified" : "Wholesale status could not be verified"}
            </Badge>
            {vendor.localVerified && <Badge tone="success">Local presence verified</Badge>}
            <Badge tone="info">Sourcing score: {score.score}/100</Badge>
          </div>
          <Link href={`/vendors/${vendor.id}/edit`}>
            <Button variant="secondary" size="sm"><Pencil size={14} /> Edit</Button>
          </Link>
        </div>

        <VendorQuickActions vendor={vendor} />

        {flags.riskLevel !== "low" && (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{flags.summary}</p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                {flags.flags.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Vendor details</CardTitle></CardHeader>
            <CardBody>
              <dl className="grid grid-cols-1 gap-y-2 text-sm">
                {infoRows.filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-[var(--text-muted)]">{label}</dt>
                    <dd className="text-right font-medium max-w-[60%]">{value}</dd>
                  </div>
                ))}
                {infoRows.every(([, v]) => !v) && (
                  <p className="text-[var(--text-muted)]">No details recorded yet — edit this vendor to add them.</p>
                )}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sourcing score breakdown</CardTitle></CardHeader>
            <CardBody className="space-y-2">
              <p className="text-xs text-[var(--text-muted)]">{score.summary}</p>
              {score.factors.map((f) => (
                <div key={f.label} className="text-sm">
                  <div className="flex justify-between">
                    <span>{f.label}</span>
                    <span className="text-[var(--text-muted)]">{f.points}/{f.maxPoints}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden mt-1">
                    <div className="h-full bg-[var(--brand)]" style={{ width: `${(f.points / f.maxPoints) * 100}%` }} />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <PriceCheckPanel vendorId={vendor.id} priceChecks={vendor.priceChecks} />
        <ContactAssistantPanel vendorId={vendor.id} existing={vendor.contactMessages} />
      </div>
    </div>
  );
}
