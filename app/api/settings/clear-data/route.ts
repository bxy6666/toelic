import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk, readJsonBody } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { clearStudyData } from "@/lib/settings-service";

export async function POST(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    const body = (await readJsonBody(request)) as Record<string, unknown>;

    if (body.confirmText !== "CLEAR") {
      throw new AppError("REQUEST_INVALID", "清除数据前必须输入确认文本 CLEAR。", 400);
    }

    await clearStudyData(user.id);
    return jsonOk({ cleared: true });
  } catch (error) {
    return handleApiError(
      error,
      new AppError("CLEAR_DATA_FAILED", "清除本地学习数据失败，请稍后重试。", 500),
    );
  }
}
