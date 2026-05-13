import { prisma } from "@/lib/prisma";

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function accuracy(total: number, correct: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function getStats() {
  const now = new Date();
  const todayStart = startOfLocalDay(now);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    totalCount,
    totalCorrect,
    todayCount,
    todayCorrect,
    listeningCount,
    listeningCorrect,
    grammarCount,
    grammarCorrect,
    activeMistakeCount,
    masteredMistakeCount,
    recentRecords,
    activeMistakes,
  ] = await Promise.all([
    prisma.practiceRecord.count(),
    prisma.practiceRecord.count({ where: { isCorrect: true } }),
    prisma.practiceRecord.count({ where: { practicedAt: { gte: todayStart } } }),
    prisma.practiceRecord.count({
      where: { practicedAt: { gte: todayStart }, isCorrect: true },
    }),
    prisma.practiceRecord.count({ where: { practiceType: "listening" } }),
    prisma.practiceRecord.count({
      where: { practiceType: "listening", isCorrect: true },
    }),
    prisma.practiceRecord.count({ where: { practiceType: "grammar" } }),
    prisma.practiceRecord.count({
      where: { practiceType: "grammar", isCorrect: true },
    }),
    prisma.mistake.count({
      where: { status: { in: ["new", "reviewing"] } },
    }),
    prisma.mistake.count({ where: { status: "mastered" } }),
    prisma.practiceRecord.findMany({
      where: { practicedAt: { gte: sevenDaysAgo } },
      select: { practicedAt: true, isCorrect: true },
    }),
    prisma.mistake.findMany({
      where: { status: { in: ["new", "reviewing"] } },
      include: { question: true },
    }),
  ]);

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(sevenDaysAgo);
    day.setDate(sevenDaysAgo.getDate() + index);
    const key = formatDateKey(day);
    const records = recentRecords.filter(
      (record) => formatDateKey(record.practicedAt) === key,
    );

    return {
      date: key,
      count: records.length,
      correct: records.filter((record) => record.isCorrect).length,
    };
  });

  const tagCounts = new Map<string, number>();

  for (const mistake of activeMistakes) {
    const tags = JSON.parse(mistake.question.tagsJson) as string[];

    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + mistake.wrongCount);
    }

    if (mistake.question.grammarPoint) {
      tagCounts.set(
        mistake.question.grammarPoint,
        (tagCounts.get(mistake.question.grammarPoint) || 0) +
          mistake.wrongCount,
      );
    }
  }

  const weakTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count]) => ({ label, count }));

  return {
    todayCount,
    todayAccuracy: accuracy(todayCount, todayCorrect),
    totalCount,
    totalAccuracy: accuracy(totalCount, totalCorrect),
    listeningAccuracy: accuracy(listeningCount, listeningCorrect),
    grammarAccuracy: accuracy(grammarCount, grammarCorrect),
    activeMistakeCount,
    masteredMistakeCount,
    last7Days,
    weakTags,
  };
}
