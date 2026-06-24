import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk, readJsonBody } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import {
  assertGenerationAllowed,
  recordGenerationUsage,
} from "@/lib/generation-usage";
import { persistQuestionImages } from "@/lib/image-storage";
import {
  attachImagesToPictureDescriptionQuestions,
  generateQuestionsWithMaas,
  type QuestionGenerationRequest,
} from "@/lib/question-generation";
import {
  buildQuestionCreateData,
  serializeQuestion,
} from "@/lib/question-mapper";
import { prisma } from "@/lib/prisma";
import type { PracticeType } from "@/lib/question-validation";

const practiceTypes = ["listening", "grammar"];
const difficulties = ["easy", "medium", "hard"];

function isPracticeType(value: unknown): value is PracticeType {
  return typeof value === "string" && practiceTypes.includes(value);
}

function isDifficulty(
  value: unknown,
): value is QuestionGenerationRequest["difficulty"] {
  return typeof value === "string" && difficulties.includes(value);
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function validateRequestBody(body: unknown): QuestionGenerationRequest {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("REQUEST_INVALID", "请求体必须是 JSON 对象。", 400);
  }

  const value = body as Record<string, unknown>;
  const practiceType = value.practiceType;
  const subtype = typeof value.subtype === "string" ? value.subtype.trim() : "";
  const difficulty = value.difficulty;
  const count = Number(value.count);
  const grammarPoint =
    typeof value.grammarPoint === "string" ? value.grammarPoint.trim() : "";

  if (!isPracticeType(practiceType)) {
    throw new AppError(
      "REQUEST_INVALID",
      "练习类型必须是 listening 或 grammar。",
      400,
    );
  }

  if (!subtype || subtype.length > 80) {
    throw new AppError("REQUEST_INVALID", "题型不能为空且不能过长。", 400);
  }

  if (!isDifficulty(difficulty)) {
    throw new AppError(
      "REQUEST_INVALID",
      "难度必须是 easy、medium 或 hard。",
      400,
    );
  }

  if (!Number.isInteger(count) || count < 1 || count > 10) {
    throw new AppError("REQUEST_INVALID", "题量必须是 1 到 10 的整数。", 400);
  }

  return {
    practiceType,
    subtype,
    difficulty,
    count,
    tags: normalizeTags(value.tags),
    grammarPoint,
  };
}

export async function POST(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    const body = await readJsonBody(request);
    const input = validateRequestBody(body);
    await assertGenerationAllowed(user.id, input.count);

    const generatedQuestions = await generateQuestionsWithMaas(input);
    const questionsWithGeneratedImages = await attachImagesToPictureDescriptionQuestions(
      input,
      generatedQuestions,
    );
    const questions = await persistQuestionImages(
      questionsWithGeneratedImages,
      user.id,
    );

    const savedQuestions = await prisma.$transaction(
      questions.map((question) =>
        prisma.question.create({
          data: buildQuestionCreateData(question, user.id),
        }),
      ),
    );

    await recordGenerationUsage(user.id, savedQuestions.length);

    return jsonOk({
      questions: savedQuestions.map(serializeQuestion),
      source: "maas",
    });
  } catch (error) {
    return handleApiError(
      error,
      new AppError(
        "AI_GENERATION_FAILED",
        "生成题目失败，请稍后重试。",
        500,
      ),
    );
  }
}
