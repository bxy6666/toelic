import { prisma } from "@/lib/prisma";
import {
  DEFAULT_MAAS_BASE_URL,
  DEFAULT_MAAS_MODEL,
  DEFAULT_USER_SETTING,
  DIFFICULTIES,
  type Difficulty,
} from "@/lib/constants";

export type SettingsPayload = {
  hasApiKey: boolean;
  maasBaseUrl: string;
  maasModel: string;
  defaultDifficulty: Difficulty;
  defaultQuestionCount: number;
  speechRate: number;
};

export type SettingsUpdateInput = {
  defaultDifficulty?: string;
  defaultQuestionCount?: number;
  speechRate?: number;
};

function isDifficulty(value: string): value is Difficulty {
  return DIFFICULTIES.includes(value as Difficulty);
}

export function getMaasConfigStatus() {
  return {
    hasApiKey: Boolean(process.env.MAAS_API_KEY?.trim()),
    maasBaseUrl: process.env.MAAS_BASE_URL || DEFAULT_MAAS_BASE_URL,
    maasModel: process.env.MAAS_MODEL || DEFAULT_MAAS_MODEL,
  };
}

export async function getOrCreateUserSetting() {
  const existing = await prisma.userSetting.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.userSetting.create({
    data: DEFAULT_USER_SETTING,
  });
}

export async function getSettings(): Promise<SettingsPayload> {
  const setting = await getOrCreateUserSetting();
  const maas = getMaasConfigStatus();
  let defaultDifficulty: Difficulty = DEFAULT_USER_SETTING.defaultDifficulty;

  if (isDifficulty(setting.defaultDifficulty)) {
    defaultDifficulty = setting.defaultDifficulty;
  }

  return {
    ...maas,
    defaultDifficulty,
    defaultQuestionCount: setting.defaultQuestionCount,
    speechRate: setting.speechRate,
  };
}

export function validateSettingsUpdate(input: SettingsUpdateInput) {
  const errors: string[] = [];

  if (
    input.defaultDifficulty !== undefined &&
    !isDifficulty(input.defaultDifficulty)
  ) {
    errors.push("默认难度必须是 easy、medium 或 hard。");
  }

  if (
    input.defaultQuestionCount !== undefined &&
    (!Number.isInteger(input.defaultQuestionCount) ||
      input.defaultQuestionCount < 1 ||
      input.defaultQuestionCount > 10)
  ) {
    errors.push("默认题量必须是 1 到 10 的整数。");
  }

  if (
    input.speechRate !== undefined &&
    (typeof input.speechRate !== "number" ||
      input.speechRate < 0.5 ||
      input.speechRate > 1.5)
  ) {
    errors.push("听力语速必须在 0.5 到 1.5 之间。");
  }

  return errors;
}

export async function updateSettings(input: SettingsUpdateInput) {
  const setting = await getOrCreateUserSetting();

  return prisma.userSetting.update({
    where: { id: setting.id },
    data: {
      defaultDifficulty: input.defaultDifficulty,
      defaultQuestionCount: input.defaultQuestionCount,
      speechRate: input.speechRate,
    },
  });
}

export async function clearStudyData() {
  await prisma.$transaction([
    prisma.practiceRecord.deleteMany(),
    prisma.mistake.deleteMany(),
    prisma.question.deleteMany(),
  ]);
}
