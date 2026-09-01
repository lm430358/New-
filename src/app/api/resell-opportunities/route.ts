import { NextRequest, NextResponse } from "next/server";
import { getActiveBusinessProfile } from "@/lib/business";
import { findResellOpportunities } from "@/lib/ai/generators/resellOpportunities";
import { describeAiError } from "@/lib/ai/errors";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const profile = await getActiveBusinessProfile();
  try {
    const result = await findResellOpportunities({ focusArea: body.focusArea, localMarket: body.localMarket }, profile);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: describeAiError(err) }, { status: 502 });
  }
}
