import { AppError } from "@/lib/errors";
import { createOrUpdateMistake } from "@/lib/mistake-service";
import { prisma } from "@/lib/prisma";

export type PracticeAnswerInput = {
  questionId: string;
  userAnswer: string;
  timeSpentSeconds?: number;
};

function normalizeAnswer(answer: string) {
  return answer.trim().toUpperCase();
}

export async function recordPracticeAnswer(input: PracticeAnswerInput) {
  const userAnswer = normalizeAnswer(input.userAnswer);

  if (!["A", "B", "C", "D"].includes(userAnswer)) {
    throw new AppError(
      "REQUEST_INVALID",
      "用户答案必须是 A、B、C 或 D。",
      400,
    );
  }

  const question = await prisma.question.findUnique({
    where: { id: input.questionId },
  });

  if (!question) {
    throw new AppError("REQUEST_INVALID", "题目不存在。", 404);
  }

  const isCorrect = question.answer === userAnswer;

  const practiceRecord = await prisma.practiceRecord.create({
    data: {
      questionId: question.id,
      practiceType: question.type,
      userAnswer,
      isCorrect,
      timeSpentSeconds: Math.max(0, input.timeSpentSeconds ?? 0),
    },
  });

  const mistake = isCorrect
    ? null
    : await createOrUpdateMistake(question.id);

  return {
    practiceRecord,
    mistake,
    result: {
      questionId: question.id,
      userAnswer,
      correctAnswer: question.answer,
      isCorrect,
      explanationZh: question.explanationZh,
      options: JSON.parse(question.optionsJson) as Record<string, string>,
      tags: JSON.parse(question.tagsJson) as string[],
      listeningScript: question.listeningScript,
      grammarPoint: question.grammarPoint,
    },
  };
}
