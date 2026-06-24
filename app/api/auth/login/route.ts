import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk, readJsonBody } from "@/lib/api-response";
import { loginOrSetup, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";
    const result = await loginOrSetup(username, password);
    const response = jsonOk({
      user: result.user,
      setupCreated: result.setupCreated,
    });

    setAuthCookie(response, result.token, result.expiresAt);

    return response;
  } catch (error) {
    return handleApiError(
      error,
      new AppError("AUTH_FAILED", "登录失败，请稍后重试。", 500),
    );
  }
}
