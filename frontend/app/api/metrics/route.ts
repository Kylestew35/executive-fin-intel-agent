export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "AAPL";

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  const res = await fetch(`${backend}/metrics?symbol=${symbol}`);
  const data = await res.json();

  return NextResponse.json(data);
}
