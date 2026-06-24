import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeQuestion } from "@/lib/question-mapper";

const practiceTypes = ["listening", "grammar"];
const difficulties = ["easy", "medium", "hard"];

function parseLimit(value: string | null) {
  if (!value) {
    return 20;
  }

  const limit = Number(value);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new AppError("REQUEST_INVALID", "limit 必须是正整数。", 400);
  }

  return Math.min(limit, 50);
}

function parseOptionalEnum(
  value: string | null,
  allowedValues: string[],
  fieldName: string,
) {
  if (!value) {
    return undefined;
  }

  if (!allowedValues.includes(value)) {
    throw new AppError(
      "REQUEST_INVALID",
      `${fieldName} 参数不合法。`,
      400,
    );
  }

  return value;
}

export async function GET(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const type = parseOptionalEnum(
      searchParams.get("type"),
      practiceTypes,
      "type",
    );
    const difficulty = parseOptionalEnum(
      searchParams.get("difficulty"),
      difficulties,
      "difficulty",
    );
    const subtype = searchParams.get("subtype")?.trim() || undefined;
    const tag = searchParams.get("tag")?.trim() || undefined;
    const limit = parseLimit(searchParams.get("limit"));

    const questions = await prisma.question.findMany({
      where: {
        userId: user.id,
        type,
        subtype,
        difficulty,
      },
      orderBy: { createdAt: "desc" },
      take: tag ? 200 : limit,
    });

    const data = questions
      .map(serializeQuestion)
      .filter((question) => !tag || question.tags.includes(tag))
      .slice(0, limit);

    return jsonOk(data);
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "读取题目列表失败。", 500),
    );
  }
}
