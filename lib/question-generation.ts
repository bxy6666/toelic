import { generateTextWithMaas } from "@/lib/maas-client";
import { AppError } from "@/lib/errors";
import { generateImageDataUrl } from "@/lib/image-generation";
import {
  parseAndValidateQuestions,
  type PracticeType,
  type ValidatedQuestion,
} from "@/lib/question-validation";
import { buildGrammarPrompt } from "@/prompts/generate-grammar-question";
import { buildListeningPrompt } from "@/prompts/generate-listening-question";

export type { ValidatedQuestion } from "@/lib/question-validation";

export type QuestionGenerationRequest = {
  practiceType: PracticeType;
  subtype: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
  tags: string[];
  grammarPoint?: string;
};

export function buildQuestionPrompt(request: QuestionGenerationRequest) {
  return request.practiceType === "listening"
    ? buildListeningPrompt(request)
    : buildGrammarPrompt(request);
}

export async function generateQuestionsWithMaas(
  request: QuestionGenerationRequest,
): Promise<ValidatedQuestion[]> {
  const prompt = buildQuestionPrompt(request);
  const messages = [
    {
      role: "system" as const,
      content:
        "You generate structured TOEIC practice questions and return strict JSON only.",
    },
    {
      role: "user" as const,
      content: prompt,
    },
  ];

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const raw = await generateTextWithMaas(messages);

    try {
      return parseAndValidateQuestions(
        raw,
        request.practiceType,
        request.subtype,
      );
    } catch (error) {
      if (
        error instanceof AppError &&
        error.code === "QUESTION_SUBTYPE_MISMATCH" &&
        attempt < 2
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError(
    "QUESTION_SUBTYPE_MISMATCH",
    "模型连续返回了与请求不一致的题型，请重试生成。",
    502,
  );
}

export async function attachImagesToPictureDescriptionQuestions(
  request: QuestionGenerationRequest,
  questions: ValidatedQuestion[],
) {
  if (
    request.practiceType !== "listening" ||
    request.subtype !== "picture-description"
  ) {
    return questions;
  }

  return Promise.all(
    questions.map(async (question) => {
      if (!question.imagePrompt) {
        throw new AppError(
          "QUESTION_VALIDATION_FAILED",
          "图片描述题缺少图片生成提示词。",
          502,
        );
      }

      const imageUrl = await generateImageDataUrl(question.imagePrompt);

      return {
        ...question,
        imageUrl,
      };
    }),
  );
}
