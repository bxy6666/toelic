import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk, readJsonBody } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import {
  deleteQuestionItem,
  serializeQuestionItem,
  updateQuestionItem,
} from "@/lib/paper-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { itemId } = await params;
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const item = await updateQuestionItem(user.id, itemId, {
      sectionId: typeof body.sectionId === "string" ? body.sectionId : undefined,
      questionNo:
        typeof body.questionNo === "string" ? body.questionNo : undefined,
      stem: typeof body.stem === "string" ? body.stem : undefined,
      answerChoice:
        typeof body.answerChoice === "string" ? body.answerChoice : undefined,
      explanationZh:
        typeof body.explanationZh === "string" ? body.explanationZh : undefined,
      difficulty:
        typeof body.difficulty === "string" ? body.difficulty : undefined,
      orderIndex: typeof body.orderIndex === "number" ? body.orderIndex : undefined,
      options: Array.isArray(body.options)
        ? (body.options as {
            optionKey: string;
            optionText: string;
            orderIndex?: number;
          }[])
        : undefined,
    });

    return jsonOk(serializeQuestionItem(item));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "更新题目失败。", 500),
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { itemId } = await params;

    return jsonOk(await deleteQuestionItem(user.id, itemId));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "删除题目失败。", 500),
    );
  }
}
