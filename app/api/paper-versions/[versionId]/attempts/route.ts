import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk, readJsonBody } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { createAttempt } from "@/lib/paper-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { versionId } = await params;
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const attempt = await createAttempt(user.id, versionId, {
      mode: typeof body.mode === "string" ? body.mode : undefined,
      durationSeconds:
        typeof body.durationSeconds === "number"
          ? body.durationSeconds
          : undefined,
      forceNew: body.forceNew === true,
    });

    return jsonOk(attempt);
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "创建作答会话失败。", 500),
    );
  }
}
