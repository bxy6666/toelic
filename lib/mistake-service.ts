import { prisma } from "@/lib/prisma";

export type MistakeListFilters = {
  type?: string;
  status?: string;
  tag?: string;
  grammarPoint?: string;
};

export async function listMistakes(filters: MistakeListFilters = {}) {
  const mistakes = await prisma.mistake.findMany({
    where: {
      status: filters.status || { not: "removed" },
      question: {
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

      const tags = JSON.parse(mistake.question.tagsJson) as string[];
      return tags.includes(filters.tag);
    })
    .map((mistake) => ({
      ...mistake,
      question: {
        ...mistake.question,
        options: JSON.parse(mistake.question.optionsJson) as Record<
          string,
          string
        >,
        tags: JSON.parse(mistake.question.tagsJson) as string[],
        optionsJson: undefined,
        tagsJson: undefined,
      },
    }));
}

export async function createOrUpdateMistake(questionId: string) {
  const existing = await prisma.mistake.findUnique({
    where: { questionId },
  });

  if (!existing) {
    return prisma.mistake.create({
      data: {
        questionId,
        wrongCount: 1,
        status: "new",
      },
    });
  }

  return prisma.mistake.update({
    where: { id: existing.id },
    data: {
      wrongCount: { increment: 1 },
      lastWrongAt: new Date(),
      status: "reviewing",
      masteredAt: null,
    },
  });
}
