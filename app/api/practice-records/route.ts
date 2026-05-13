import { NextResponse } from "next/server";

import { AppError, isAppError } from "@/lib/errors";
import { recordPracticeAnswer } from "@/lib/practice-service";

function jsonError(error: AppError) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
    },
    { status: error.status },
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
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
      questionId,
      userAnswer,
      timeSpentSeconds,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error);
    }

    return jsonError(
      new AppError("DATABASE_WRITE_FAILED", "保存答题记录失败。", 500),
    );
  }
}
