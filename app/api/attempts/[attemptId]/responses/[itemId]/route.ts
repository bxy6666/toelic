import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk, readJsonBody } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { saveAttemptResponse } from "@/lib/paper-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ attemptId: string; itemId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { attemptId, itemId } = await params;
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const response = await saveAttemptResponse(user.id, attemptId, itemId, {
      choice: typeof body.choice === "string" ? body.choice : "",
      timeSpentSeconds:
        typeof body.timeSpentSeconds === "number"
          ? body.timeSpentSeconds
          : undefined,
    });

    return jsonOk(response);
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "保存作答失败。", 500),
    );
  }
}
