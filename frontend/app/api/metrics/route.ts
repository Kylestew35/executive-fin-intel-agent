export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "AAPL";

  const res = await fetch(`http://localhost:8000/metrics?symbol=${symbol}`);
  const data = await res.json();

  return NextResponse.json(data);
}
