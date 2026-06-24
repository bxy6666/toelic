import type { Question } from "@prisma/client";

import type { QuestionOptionKey, ValidatedQuestion } from "@/lib/question-validation";

export type QuestionPayload = Omit<Question, "optionsJson" | "tagsJson"> & {
  options: Record<QuestionOptionKey, string>;
  tags: string[];
};

export function parseQuestionOptions(optionsJson: string) {
  return JSON.parse(optionsJson) as Record<QuestionOptionKey, string>;
}

export function parseQuestionTags(tagsJson: string) {
  return JSON.parse(tagsJson) as string[];
}

export function serializeQuestion(question: Question): QuestionPayload {
  const { optionsJson, tagsJson, ...rest } = question;

  return {
    ...rest,
    options: parseQuestionOptions(optionsJson),
    tags: parseQuestionTags(tagsJson),
  };
}

export function serializeQuestionWithRelations<
  T extends { question: Question },
>(value: T) {
  return {
    ...value,
    question: serializeQuestion(value.question),
  };
}

export function buildQuestionCreateData(
  question: ValidatedQuestion,
  userId: string,
) {
  return {
    userId,
    type: question.type,
    subtype: question.subtype,
    difficulty: question.difficulty,
    prompt: question.prompt,
    optionsJson: JSON.stringify(question.options),
    answer: question.answer,
    explanationZh: question.explanationZh,
    tagsJson: JSON.stringify(question.tags),
    listeningScript: question.listeningScript,
    grammarPoint: question.grammarPoint,
    imageUrl: question.imageUrl,
    imagePrompt: question.imagePrompt,
    source: "maas",
  };
}
