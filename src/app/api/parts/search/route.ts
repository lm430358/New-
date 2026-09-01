import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessProfile } from "@/lib/business";
import { identifyPart, type PartSearchInput } from "@/lib/ai/generators/partIdentification";
import { describeAiError } from "@/lib/ai/errors";
import { toJson } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PartSearchInput;
  const profile = await getActiveBusinessProfile();

  if (!Object.values(body).some((v) => v && String(v).trim())) {
    return NextResponse.json({ error: "Enter at least one search detail." }, { status: 400 });
  }

  let result;
  try {
    result = await identifyPart(body, profile);
  } catch (err) {
    return NextResponse.json({ error: describeAiError(err) }, { status: 502 });
  }

  const log = await prisma.partSearchLog.create({
    data: {
      businessProfileId: profile?.id,
      year: body.year || null,
      make: body.make || null,
      model: body.model || null,
      trim: body.trim || null,
      engine: body.engine || null,
      vin: body.vin || null,
      partName: body.partName || null,
      partNumber: body.partNumber || null,
      oemPartNumber: body.oemPartNumber || null,
      aftermarketNumber: body.aftermarketNumber || null,
      symptoms: body.symptoms || null,
      rawQuery: body.rawQuery || null,
      identifiedCategory: result.likelyPartCategory,
      aiNotes: toJson(result),
    },
  });

  return NextResponse.json({ result, logId: log.id });
}

export async function GET() {
  const searches = await prisma.partSearchLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ searches });
}
