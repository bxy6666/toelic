import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { completeImportAnswers } from "@/lib/paper-import-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { jobId } = await params;
    return jsonOk(await completeImportAnswers(user.id, jobId));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("AI_GENERATION_FAILED", "AI answer completion failed.", 500),
    );
  }
}

