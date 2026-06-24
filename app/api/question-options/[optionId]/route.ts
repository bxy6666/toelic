import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { deleteQuestionOption } from "@/lib/paper-service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ optionId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { optionId } = await params;

    return jsonOk(await deleteQuestionOption(user.id, optionId));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "删除选项失败。", 500),
    );
  }
}
