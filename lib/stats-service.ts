import { prisma } from "@/lib/prisma";
import { parseQuestionTags } from "@/lib/question-mapper";

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

export function summarizeDailyRecords(
  records: { practicedAt: Date; isCorrect: boolean }[],
  startDate: Date,
  dayCount: number,
) {
  const countsByDate = new Map<string, { count: number; correct: number }>();

  for (const record of records) {
    const key = formatDateKey(record.practicedAt);
    const current = countsByDate.get(key) ?? { count: 0, correct: 0 };
    current.count += 1;
    if (record.isCorrect) {
      current.correct += 1;
    }
    countsByDate.set(key, current);
  }

  return Array.from({ length: dayCount }, (_, index) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + index);
    const date = formatDateKey(day);
    const summary = countsByDate.get(date);

    return {
      date,
      count: summary?.count ?? 0,
      correct: summary?.correct ?? 0,
    };
  });
}

export async function getStats(userId: string) {
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
    prisma.practiceRecord.count({ where: { userId } }),
    prisma.practiceRecord.count({ where: { userId, isCorrect: true } }),
    prisma.practiceRecord.count({ where: { userId, practicedAt: { gte: todayStart } } }),
    prisma.practiceRecord.count({
      where: { userId, practicedAt: { gte: todayStart }, isCorrect: true },
    }),
    prisma.practiceRecord.count({ where: { userId, practiceType: "listening" } }),
    prisma.practiceRecord.count({
      where: { userId, practiceType: "listening", isCorrect: true },
    }),
    prisma.practiceRecord.count({ where: { userId, practiceType: "grammar" } }),
    prisma.practiceRecord.count({
      where: { userId, practiceType: "grammar", isCorrect: true },
    }),
    prisma.mistake.count({
      where: { userId, status: { in: ["new", "reviewing"] } },
    }),
    prisma.mistake.count({ where: { userId, status: "mastered" } }),
    prisma.practiceRecord.findMany({
      where: { userId, practicedAt: { gte: sevenDaysAgo } },
      select: { practicedAt: true, isCorrect: true },
    }),
    prisma.mistake.findMany({
      where: { userId, status: { in: ["new", "reviewing"] } },
      include: { question: true },
    }),
  ]);

  const last7Days = summarizeDailyRecords(recentRecords, sevenDaysAgo, 7);

  const tagCounts = new Map<string, number>();

  for (const mistake of activeMistakes) {
    const tags = parseQuestionTags(mistake.question.tagsJson);

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
