import { NextResponse } from "next/server";

import { getStats } from "@/lib/stats-service";

export async function GET() {
  const data = await getStats();
  return NextResponse.json({ ok: true, data });
}
