import { NextResponse } from "next/server";

import { requireUserFromRequest } from "@/lib/auth";
import { createAttempt } from "@/lib/paper-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const user = await requireUserFromRequest(request);
  const { versionId } = await params;
  const attempt = await createAttempt(user.id, versionId, { forceNew: true });

  return NextResponse.redirect(
    new URL(`/paper-versions/${versionId}/take?attemptId=${attempt.id}`, request.url),
  );
}
