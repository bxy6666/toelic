import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { getPaperImport } from "@/lib/paper-import-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { jobId } = await params;
    return jsonOk(await getPaperImport(user.id, jobId));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DOCUMENT_PARSE_FAILED", "Import job read failed.", 500),
    );
  }
}

