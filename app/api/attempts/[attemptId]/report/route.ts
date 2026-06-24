import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { getAttemptReport } from "@/lib/paper-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { attemptId } = await params;

    return jsonOk(await getAttemptReport(user.id, attemptId));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_READ_FAILED", "读取作答报告失败。", 500),
    );
  }
}
