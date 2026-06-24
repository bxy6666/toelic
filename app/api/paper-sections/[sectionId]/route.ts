import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { deletePaperSection } from "@/lib/paper-service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { sectionId } = await params;

    return jsonOk(await deletePaperSection(user.id, sectionId));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "删除分区失败。", 500),
    );
  }
}
