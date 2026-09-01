import type { SourcingScoreResult } from "@/lib/types";

export interface VendorForScoring {
  wholesaleStatus: string;
  localVerified: boolean;
  website: string | null;
  phone: string | null;
  returnPolicy: string | null;
  warrantyInfo: string | null;
  shippingInfo: string | null;
  minimumOrder: string | null;
  internalRating: number | null;
  status: string;
  verificationDate: Date | string | null;
  priceCheckCount: number;
  matchesPreferredSupplier: boolean;
  matchesPreferredBrand: boolean;
}

/**
 * A transparent, rule-based 0-100 score — every point is explained, and the
 * factors are all things the user themselves recorded about the vendor (not
 * an opaque AI judgment). This is an organizing signal, not a guarantee of
 * vendor quality: see the disclaimer surfaced alongside it in the UI.
 */
export function computeSourcingScore(v: VendorForScoring): SourcingScoreResult {
  const factors: SourcingScoreResult["factors"] = [];

  const identity = (v.website ? 8 : 0) + (v.phone ? 7 : 0);
  factors.push({
    label: "Verifiable identity",
    points: identity,
    maxPoints: 15,
    explanation: v.website || v.phone
      ? "Has a website and/or phone number on file, so the business can be independently checked."
      : "No website or phone recorded — harder to verify this is a real, reachable business.",
  });

  const policies = (v.returnPolicy ? 8 : 0) + (v.warrantyInfo ? 7 : 0);
  factors.push({
    label: "Return policy & warranty on file",
    points: policies,
    maxPoints: 15,
    explanation: policies > 0
      ? "Return policy and/or warranty terms have been recorded."
      : "No return policy or warranty terms recorded yet — ask before purchasing.",
  });

  const logistics = (v.shippingInfo ? 7 : 0) + (v.minimumOrder ? 6 : 0);
  factors.push({
    label: "Shipping & order terms known",
    points: logistics,
    maxPoints: 13,
    explanation: logistics > 0
      ? "Shipping and/or minimum order terms are recorded."
      : "Shipping and minimum order requirements are not yet recorded.",
  });

  const wholesalePts = v.wholesaleStatus === "verified" ? 12 : 0;
  factors.push({
    label: "Wholesale status",
    points: wholesalePts,
    maxPoints: 12,
    explanation: v.wholesaleStatus === "verified"
      ? "Wholesale/trade pricing has been confirmed directly with this vendor."
      : "Wholesale availability has not been confirmed — treat any wholesale pricing as unverified.",
  });

  const localPts = v.localVerified ? 6 : 0;
  factors.push({
    label: "Local business verified",
    points: localPts,
    maxPoints: 6,
    explanation: v.localVerified
      ? "Physical location/local presence has been verified."
      : "Local presence not verified.",
  });

  const trackRecordMap: Record<string, number> = {
    researching: 0,
    contacted: 4,
    approved: 10,
    purchased: 14,
    do_not_use: 0,
  };
  const trackRecord = trackRecordMap[v.status] ?? 0;
  factors.push({
    label: "Your track record with this vendor",
    points: trackRecord,
    maxPoints: 14,
    explanation:
      v.status === "do_not_use"
        ? "Marked Do Not Use — this drags the score down regardless of other factors."
        : `Current status: ${v.status.replace(/_/g, " ")}.`,
  });

  const ratingPts = v.internalRating ? Math.round((v.internalRating / 5) * 10) : 0;
  factors.push({
    label: "Your internal rating",
    points: ratingPts,
    maxPoints: 10,
    explanation: v.internalRating
      ? `You rated this vendor ${v.internalRating}/5.`
      : "No internal rating recorded yet.",
  });

  const priceCheckPts = Math.min(8, v.priceCheckCount * 2);
  factors.push({
    label: "Logged price history",
    points: priceCheckPts,
    maxPoints: 8,
    explanation: v.priceCheckCount > 0
      ? `${v.priceCheckCount} price check(s) logged for this vendor.`
      : "No price checks logged yet.",
  });

  const prefPts = (v.matchesPreferredSupplier ? 4 : 0) + (v.matchesPreferredBrand ? 3 : 0);
  factors.push({
    label: "Matches your preferences",
    points: prefPts,
    maxPoints: 7,
    explanation:
      prefPts > 0
        ? "Matches one or more of your preferred suppliers/brands from your business profile."
        : "Doesn't match a preferred supplier/brand on file (or none are set).",
  });

  let score = factors.reduce((sum, f) => sum + f.points, 0);
  if (v.status === "do_not_use") {
    score = Math.min(score, 20);
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    factors,
    summary:
      "This score is calculated only from information you (or a verified check) recorded about this vendor — " +
      "it is an organizing signal for your own review, not an independent guarantee of vendor quality or legitimacy.",
  };
}
