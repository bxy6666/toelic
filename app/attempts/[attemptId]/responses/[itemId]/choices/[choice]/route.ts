import { NextResponse } from "next/server";

import { requireUserFromRequest } from "@/lib/auth";
import { saveAttemptResponse } from "@/lib/paper-service";

export async function GET(
  request: Request,
  {
    params,
  }: { params: Promise<{ attemptId: string; itemId: string; choice: string }> },
) {
  const user = await requireUserFromRequest(request);
  const { attemptId, itemId, choice } = await params;
  await saveAttemptResponse(user.id, attemptId, itemId, { choice });

  return NextResponse.redirect(request.headers.get("referer") ?? new URL("/", request.url));
}
