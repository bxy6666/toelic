import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { publishPaperVersion } from "@/lib/paper-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { versionId } = await params;

    return jsonOk(await publishPaperVersion(user.id, versionId));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "发布试卷版本失败。", 500),
    );
  }
}
