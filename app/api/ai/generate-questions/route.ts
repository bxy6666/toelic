import { NextResponse } from "next/server";

import { AppError, isAppError } from "@/lib/errors";
import {
  attachImagesToPictureDescriptionQuestions,
  generateQuestionsWithMaas,
  type QuestionGenerationRequest,
} from "@/lib/question-generation";
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

function jsonError(error: AppError) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
    },
    { status: error.status },
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = validateRequestBody(body);
    const generatedQuestions = await generateQuestionsWithMaas(input);
    const questions = await attachImagesToPictureDescriptionQuestions(
      input,
      generatedQuestions,
    );

    const savedQuestions = await prisma.$transaction(
      questions.map((question) =>
        prisma.question.create({
          data: {
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
          },
        }),
      ),
    );

    return NextResponse.json({
      ok: true,
      data: {
        questions: savedQuestions.map((question) => ({
          ...question,
          options: JSON.parse(question.optionsJson) as Record<string, string>,
          tags: JSON.parse(question.tagsJson) as string[],
          optionsJson: undefined,
          tagsJson: undefined,
        })),
        source: "maas",
      },
    });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error);
    }

    return jsonError(
      new AppError(
        "AI_GENERATION_FAILED",
        "生成题目失败，请稍后重试。",
        500,
      ),
    );
  }
}
