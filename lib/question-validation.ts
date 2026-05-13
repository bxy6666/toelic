import { AppError } from "@/lib/errors";

export type PracticeType = "listening" | "grammar";
export type QuestionOptionKey = "A" | "B" | "C" | "D";

export type ValidatedQuestion = {
  type: PracticeType;
  subtype: string;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  options: Record<QuestionOptionKey, string>;
  answer: QuestionOptionKey;
  explanationZh: string;
  tags: string[];
  listeningScript?: string;
  grammarPoint?: string;
  imagePrompt?: string;
  imageUrl?: string;
};

const optionKeys: QuestionOptionKey[] = ["A", "B", "C", "D"];
const difficulties = ["easy", "medium", "hard"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseAiJson(raw: string) {
  const trimmed = raw.trim();
  const fencedJson = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonText = fencedJson ? fencedJson[1].trim() : trimmed;

  if (!fencedJson && trimmed.includes("```")) {
    throw new AppError(
      "AI_RESPONSE_INVALID",
      "模型返回了 Markdown 代码块，而不是严格 JSON。",
      502,
    );
  }

  try {
    return JSON.parse(jsonText) as unknown;
  } catch {
    throw new AppError(
      "AI_RESPONSE_INVALID",
      "模型返回内容不是有效 JSON。",
      502,
    );
  }
}

function validateOptions(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const keys = Object.keys(value);

  if (
    keys.length !== optionKeys.length ||
    !optionKeys.every((key) => keys.includes(key))
  ) {
    return null;
  }

  const options = {} as Record<QuestionOptionKey, string>;

  for (const key of optionKeys) {
    const option = asNonEmptyString(value[key]);

    if (!option) {
      return null;
    }

    options[key] = option;
  }

  const uniqueValues = new Set(Object.values(options));

  if (uniqueValues.size !== optionKeys.length) {
    return null;
  }

  return options;
}

function validateQuestion(
  value: unknown,
  expectedType: PracticeType,
  expectedSubtype?: string,
) {
  if (!isRecord(value)) {
    return null;
  }

  const type = asNonEmptyString(value.type);
  const subtype = asNonEmptyString(value.subtype);
  const difficulty = asNonEmptyString(value.difficulty);
  const prompt = asNonEmptyString(value.prompt);
  const explanationZh = asNonEmptyString(value.explanationZh);
  const answer = asNonEmptyString(value.answer);
  const options = validateOptions(value.options);
  const tags = Array.isArray(value.tags)
    ? value.tags.map(asNonEmptyString).filter((tag): tag is string => Boolean(tag))
    : [];

  if (
    type !== expectedType ||
    !subtype ||
    !difficulty ||
    !difficulties.includes(difficulty) ||
    !prompt ||
    !explanationZh ||
    !answer ||
    !optionKeys.includes(answer as QuestionOptionKey) ||
    !options
  ) {
    return null;
  }

  if (expectedSubtype && subtype !== expectedSubtype) {
    throw new AppError(
      "QUESTION_SUBTYPE_MISMATCH",
      `模型返回的题型 ${subtype} 与请求题型 ${expectedSubtype} 不一致。`,
      502,
    );
  }

  if (!options[answer as QuestionOptionKey]) {
    return null;
  }

  const baseQuestion: ValidatedQuestion = {
    type: expectedType,
    subtype,
    difficulty: difficulty as ValidatedQuestion["difficulty"],
    prompt,
    options,
    answer: answer as QuestionOptionKey,
    explanationZh,
    tags,
  };

  if (expectedType === "listening") {
    const listeningScript = asNonEmptyString(value.listeningScript);
    const imagePrompt = asNonEmptyString(value.imagePrompt);

    if (!listeningScript) {
      return null;
    }

    if (expectedSubtype === "picture-description" && !imagePrompt) {
      return null;
    }

    return { ...baseQuestion, listeningScript, imagePrompt: imagePrompt || undefined };
  }

  const grammarPoint = asNonEmptyString(value.grammarPoint);

  if (!grammarPoint) {
    return null;
  }

  return { ...baseQuestion, grammarPoint };
}

export function parseAndValidateQuestions(
  raw: string,
  expectedType: PracticeType,
  expectedSubtype?: string,
) {
  const parsed = parseAiJson(raw);

  if (!isRecord(parsed) || !Array.isArray(parsed.questions)) {
    throw new AppError(
      "AI_RESPONSE_INVALID",
      "模型 JSON 缺少 questions 数组。",
      502,
    );
  }

  const questions = parsed.questions.map((item) =>
    validateQuestion(item, expectedType, expectedSubtype),
  );

  if (questions.some((question) => !question)) {
    throw new AppError(
      "QUESTION_VALIDATION_FAILED",
      "模型返回的题目字段不完整或答案不合法。",
      502,
    );
  }

  return questions as ValidatedQuestion[];
}
