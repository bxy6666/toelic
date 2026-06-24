import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { getStats } from "@/lib/stats-service";

export async function GET(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    const data = await getStats(user.id);
    return jsonOk(data);
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_READ_FAILED", "读取学习统计失败。", 500),
    );
  }
}
