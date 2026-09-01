import { NextRequest, NextResponse } from "next/server";
import { decodeVin, isPlausibleVin } from "@/lib/vin";

export async function POST(req: NextRequest) {
  const { vin } = await req.json();
  if (!vin || typeof vin !== "string") {
    return NextResponse.json({ error: "VIN is required." }, { status: 400 });
  }
  if (!isPlausibleVin(vin)) {
    return NextResponse.json(
      { error: "That doesn't look like a valid 17-character VIN (VINs never contain I, O, or Q)." },
      { status: 400 }
    );
  }
  try {
    const decoded = await decodeVin(vin);
    return NextResponse.json({ decoded });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "VIN lookup failed." },
      { status: 502 }
    );
  }
}
