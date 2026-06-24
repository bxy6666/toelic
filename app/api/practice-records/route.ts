import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk, readJsonBody } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { recordPracticeAnswer } from "@/lib/practice-service";

export async function POST(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const questionId =
      typeof body.questionId === "string" ? body.questionId.trim() : "";
    const userAnswer =
      typeof body.userAnswer === "string" ? body.userAnswer.trim() : "";
    const timeSpentSeconds =
      typeof body.timeSpentSeconds === "number" ? body.timeSpentSeconds : 0;

    if (!questionId || !userAnswer) {
      throw new AppError(
        "REQUEST_INVALID",
        "题目 ID 和用户答案不能为空。",
        400,
      );
    }

    const data = await recordPracticeAnswer({
      userId: user.id,
      questionId,
      userAnswer,
      timeSpentSeconds,
    });

    return jsonOk(data);
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "保存答题记录失败。", 500),
    );
  }
}
