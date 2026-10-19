import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const where = q
    ? {
        OR: [
          { partDescription: { contains: q } },
          { partNumber: { contains: q } },
          { brand: { contains: q } },
        ],
      }
    : {};
  const priceChecks = await prisma.priceCheck.findMany({
    where,
    include: { vendor: { select: { id: true, name: true } } },
    orderBy: { checkedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ priceChecks });
}
