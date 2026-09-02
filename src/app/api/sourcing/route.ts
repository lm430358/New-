import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessProfile } from "@/lib/business";
import { buildSmartSourcingPlan, type SourcingCandidateVendor } from "@/lib/ai/generators/smartSourcing";
import { computeSourcingScore, matchPreferences } from "@/lib/sourcingScore";
import { describeAiError } from "@/lib/ai/errors";
import { safeJsonParse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { request } = await req.json();
  if (!request || !String(request).trim()) {
    return NextResponse.json({ error: "Describe what you're sourcing." }, { status: 400 });
  }

  const profile = await getActiveBusinessProfile();

  // Pull all saved vendors as candidates — the AI is instructed to only rank
  // from this list, never invent one. For a larger vendor DB this would be
  // narrowed with a real search/filter step first.
  const vendors = await prisma.vendor.findMany({
    where: { status: { not: "do_not_use" } },
    include: { priceChecks: { orderBy: { checkedAt: "desc" } } },
    take: 25,
  });

  const preferredSuppliers = safeJsonParse<string[]>(profile?.preferredSuppliers, []);
  const preferredBrands = safeJsonParse<string[]>(profile?.preferredBrands, []);

  const candidates: SourcingCandidateVendor[] = vendors.map((v) => {
    const vendorBrands = v.priceChecks.map((p) => p.brand).filter((b): b is string => !!b);
    const { matchesPreferredSupplier, matchesPreferredBrand } = matchPreferences(
      preferredSuppliers,
      preferredBrands,
      v.name,
      vendorBrands
    );
    const score = computeSourcingScore({
      wholesaleStatus: v.wholesaleStatus,
      localVerified: v.localVerified,
      website: v.website,
      phone: v.phone,
      returnPolicy: v.returnPolicy,
      warrantyInfo: v.warrantyInfo,
      shippingInfo: v.shippingInfo,
      minimumOrder: v.minimumOrder,
      internalRating: v.internalRating,
      status: v.status,
      verificationDate: v.verificationDate,
      priceCheckCount: v.priceChecks.length,
      matchesPreferredSupplier,
      matchesPreferredBrand,
    });
    return {
      name: v.name,
      vendorType: v.vendorType,
      wholesaleStatus: v.wholesaleStatus,
      city: v.city,
      state: v.state,
      lastKnownPrice: v.priceChecks[0]?.totalCost != null ? `$${v.priceChecks[0].totalCost.toFixed(2)}` : undefined,
      sourcingScore: score.score,
      notes: v.notes,
    };
  });

  try {
    const plan = await buildSmartSourcingPlan(request, candidates, profile);
    return NextResponse.json({ plan, candidateCount: candidates.length });
  } catch (err) {
    return NextResponse.json({ error: describeAiError(err) }, { status: 502 });
  }
}
