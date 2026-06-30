import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { checkMaasConnection } from "@/lib/settings-service";

export async function POST(request: Request) {
  try {
    await requireUserFromRequest(request);
    return jsonOk(await checkMaasConnection());
  } catch (error) {
    return handleApiError(
      error,
      new AppError("AI_GENERATION_FAILED", "MaaS connection check failed.", 500),
    );
  }
}

