import { NextResponse } from "next/server";

import { requireUserFromRequest } from "@/lib/auth";
import { submitAttempt } from "@/lib/paper-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  const user = await requireUserFromRequest(request);
  const { attemptId } = await params;
  await submitAttempt(user.id, attemptId);

  return NextResponse.redirect(new URL(`/attempts/${attemptId}/report`, request.url));
}
