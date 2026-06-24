import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { submitAttempt } from "@/lib/paper-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { attemptId } = await params;

    return jsonOk(await submitAttempt(user.id, attemptId));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "提交批改失败。", 500),
    );
  }
}
