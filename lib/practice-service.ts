import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { parseQuestionOptions, parseQuestionTags } from "@/lib/question-mapper";

export type PracticeAnswerInput = {
  userId: string;
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

  const question = await prisma.question.findFirst({
    where: { id: input.questionId, userId: input.userId },
  });

  if (!question) {
    throw new AppError("REQUEST_INVALID", "题目不存在。", 404);
  }

  const isCorrect = question.answer === userAnswer;

  const { practiceRecord, mistake } = await prisma.$transaction(async (tx) => {
    const practiceRecord = await tx.practiceRecord.create({
      data: {
        userId: input.userId,
        questionId: question.id,
        practiceType: question.type,
        userAnswer,
        isCorrect,
        timeSpentSeconds: Math.max(0, input.timeSpentSeconds ?? 0),
      },
    });
    const mistake = isCorrect
      ? null
      : await tx.mistake.upsert({
          where: { questionId: question.id },
          create: {
            userId: input.userId,
            questionId: question.id,
            wrongCount: 1,
            status: "new",
          },
          update: {
            userId: input.userId,
            wrongCount: { increment: 1 },
            lastWrongAt: new Date(),
            status: "reviewing",
            masteredAt: null,
          },
        });

    return { practiceRecord, mistake };
  });

  return {
    practiceRecord,
    mistake,
    result: {
      questionId: question.id,
      userAnswer,
      correctAnswer: question.answer,
      isCorrect,
      explanationZh: question.explanationZh,
      options: parseQuestionOptions(question.optionsJson),
      tags: parseQuestionTags(question.tagsJson),
      listeningScript: question.listeningScript,
      grammarPoint: question.grammarPoint,
    },
  };
}
