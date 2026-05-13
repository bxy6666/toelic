export const DEFAULT_MAAS_BASE_URL = "https://api.modelarts-maas.com/v1/";
export const DEFAULT_MAAS_MODEL = "deepseek-v3.2";

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const DEFAULT_USER_SETTING = {
  defaultDifficulty: "medium",
  defaultQuestionCount: 5,
  speechRate: 1,
} as const;
