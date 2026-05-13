import { NextResponse } from "next/server";

import { listMistakes } from "@/lib/mistake-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const grammarPoint = searchParams.get("grammarPoint") || undefined;

  const data = await listMistakes({ type, status, tag, grammarPoint });

  return NextResponse.json({ ok: true, data });
}
