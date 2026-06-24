import { AppError } from "@/lib/errors";
import { clearAuthCookie, logoutRequest } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    await logoutRequest(request);
    const response = jsonOk({ loggedOut: true });

    clearAuthCookie(response);

    return response;
  } catch (error) {
    return handleApiError(
      error,
      new AppError("AUTH_FAILED", "退出登录失败，请稍后重试。", 500),
    );
  }
}
