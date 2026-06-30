import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { applyPaperImport } from "@/lib/paper-import-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { jobId } = await params;
    return jsonOk(await applyPaperImport(user.id, jobId));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "Creating draft paper failed.", 500),
    );
  }
}

