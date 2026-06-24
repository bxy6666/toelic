import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { getPaperDetail } from "@/lib/paper-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ paperId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { paperId } = await params;

    return jsonOk(await getPaperDetail(user.id, paperId));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_READ_FAILED", "读取试卷详情失败。", 500),
    );
  }
}
