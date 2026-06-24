import { prisma } from "@/lib/prisma";
import { serializeQuestionWithRelations } from "@/lib/question-mapper";

export type MistakeListFilters = {
  type?: string;
  status?: string;
  tag?: string;
  grammarPoint?: string;
};

export async function listMistakes(userId: string, filters: MistakeListFilters = {}) {
  const mistakes = await prisma.mistake.findMany({
    where: {
      userId,
      status: filters.status || { not: "removed" },
      question: {
        userId,
        type: filters.type,
        grammarPoint: filters.grammarPoint,
      },
    },
    include: {
      question: true,
    },
    orderBy: { lastWrongAt: "desc" },
  });

  return mistakes
    .filter((mistake) => {
      if (!filters.tag) {
        return true;
      }

      return serializeQuestionWithRelations(mistake).question.tags.includes(filters.tag);
    })
    .map(serializeQuestionWithRelations);
}

export async function createOrUpdateMistake(userId: string, questionId: string) {
  return prisma.mistake.upsert({
    where: { questionId },
    create: {
      userId,
      questionId,
      wrongCount: 1,
      status: "new",
    },
    update: {
      userId,
      wrongCount: { increment: 1 },
      lastWrongAt: new Date(),
      status: "reviewing",
      masteredAt: null,
    },
  });
}
