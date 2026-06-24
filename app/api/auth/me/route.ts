import { AppError } from "@/lib/errors";
import { getAuthStatus } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    return jsonOk(await getAuthStatus(request));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("AUTH_FAILED", "读取登录状态失败。", 500),
    );
  }
}
