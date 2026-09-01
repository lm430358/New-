import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const where = q
    ? {
        OR: [
          { originalPartNumber: { contains: q } },
          { alternatePartNumber: { contains: q } },
        ],
      }
    : {};
  const results = await prisma.crossReference.findMany({
    where,
    include: { vendor: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ results });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.originalPartNumber || !body.alternatePartNumber) {
    return NextResponse.json({ error: "Both an original and alternate part number are required." }, { status: 400 });
  }
  const entry = await prisma.crossReference.create({
    data: {
      vendorId: body.vendorId || null,
      originalPartNumber: String(body.originalPartNumber).trim(),
      originalIsOem: body.originalIsOem !== false,
      alternatePartNumber: String(body.alternatePartNumber).trim(),
      manufacturer: body.manufacturer || null,
      compatibilityNotes: body.compatibilityNotes || null,
      source: body.source || null,
      status: body.status === "verified" ? "verified" : "potential",
    },
  });
  return NextResponse.json({ entry });
}
