import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk, readJsonBody } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { createQuestionItem, serializeQuestionItem } from "@/lib/paper-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { versionId } = await params;
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const item = await createQuestionItem(user.id, versionId, {
      sectionId: typeof body.sectionId === "string" ? body.sectionId : null,
      questionNo: typeof body.questionNo === "string" ? body.questionNo : "",
      stem: typeof body.stem === "string" ? body.stem : "",
      answerChoice:
        typeof body.answerChoice === "string" ? body.answerChoice : "",
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
      new AppError("DATABASE_WRITE_FAILED", "创建题目失败。", 500),
    );
  }
}
