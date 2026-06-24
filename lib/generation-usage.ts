import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const DEFAULT_DAILY_GENERATION_LIMIT = 50;

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dailyLimit() {
  const configured = Number(process.env.DAILY_AI_GENERATION_LIMIT);

  if (Number.isInteger(configured) && configured > 0) {
    return configured;
  }

  return DEFAULT_DAILY_GENERATION_LIMIT;
}

export async function assertGenerationAllowed(userId: string, requestedCount: number) {
  const dateKey = todayKey();
  const current = await prisma.generationUsage.findUnique({
    where: { userId_dateKey: { userId, dateKey } },
  });
  const limit = dailyLimit();

  if ((current?.count ?? 0) + requestedCount > limit) {
    throw new AppError(
      "GENERATION_LIMIT_EXCEEDED",
      `今日 AI 生成题量已接近上限（${limit} 题），请明天再试或调整 DAILY_AI_GENERATION_LIMIT。`,
      429,
    );
  }
}

export async function recordGenerationUsage(userId: string, generatedCount: number) {
  const dateKey = todayKey();

  await prisma.generationUsage.upsert({
    where: { userId_dateKey: { userId, dateKey } },
    create: {
      userId,
      dateKey,
      count: generatedCount,
    },
    update: {
      count: { increment: generatedCount },
    },
  });
}
