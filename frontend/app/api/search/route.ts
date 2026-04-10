export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const res = await fetch(`http://localhost:8000/search?query=${query}`);
  const data = await res.json();

  return NextResponse.json(data);
}
