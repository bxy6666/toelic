import { Prisma } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const optionKeys = ["A", "B", "C", "D"] as const;
const defaultDurationSeconds = 7200;

type OptionKey = (typeof optionKeys)[number];

type PaperOptionInput = {
  optionKey: string;
  optionText: string;
  orderIndex?: number;
};

type QuestionItemInput = {
  sectionId?: string | null;
  questionNo: string;
  stem: string;
  answerChoice: string;
  explanationZh?: string;
  difficulty?: string;
  orderIndex?: number;
  options?: PaperOptionInput[];
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function optionalText(value: unknown) {
  const normalized = text(value);
  return normalized ? normalized : null;
}

function normalizeOptionKey(value: string) {
  return value.trim().toUpperCase();
}

function assertOptionKey(value: string): asserts value is OptionKey {
  if (!optionKeys.includes(value as OptionKey)) {
    throw new AppError("REQUEST_INVALID", "选项必须是 A、B、C 或 D。", 400);
  }
}

function readAnswerChoice(answerKeyJson: string) {
  try {
    const value = JSON.parse(answerKeyJson) as { choice?: unknown };
    return typeof value.choice === "string"
      ? normalizeOptionKey(value.choice)
      : "";
  } catch {
    return "";
  }
}

function answerKeyJson(choice: string) {
  const normalized = normalizeOptionKey(choice);
  assertOptionKey(normalized);
  return JSON.stringify({ choice: normalized });
}

function explanationJson(explanationZh?: string | null) {
  return JSON.stringify({ zh: explanationZh?.trim() || "" });
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeOptions(options: PaperOptionInput[] | undefined) {
  if (!options) {
    return undefined;
  }

  return options.map((option, index) => {
    const optionKey = normalizeOptionKey(option.optionKey);
    assertOptionKey(optionKey);

    const optionText = option.optionText.trim();
    if (!optionText) {
      throw new AppError("REQUEST_INVALID", "选项内容不能为空。", 400);
    }

    return {
      optionKey,
      optionText,
      orderIndex: option.orderIndex ?? index + 1,
    };
  });
}

function ensureDraftStatus(status: string) {
  if (status !== "draft") {
    throw new AppError(
      "VERSION_NOT_EDITABLE",
      "只有 draft 状态的试卷版本可以编辑。",
      409,
    );
  }
}

function ensureSingleChoiceInput(input: QuestionItemInput) {
  if (!input.questionNo.trim()) {
    throw new AppError("REQUEST_INVALID", "题号不能为空。", 400);
  }

  if (!input.stem.trim()) {
    throw new AppError("REQUEST_INVALID", "题干不能为空。", 400);
  }

  answerKeyJson(input.answerChoice);
}

export function serializeQuestionItem(
  item: {
    id: string;
    paperVersionId: string;
    sectionId: string | null;
    questionNo: string;
    itemType: string;
    stem: string;
    answerKeyJson: string;
    explanationJson: string | null;
    difficulty: string | null;
    orderIndex: number;
    options?: {
      id: string;
      optionKey: string;
      optionText: string;
      orderIndex: number;
    }[];
  },
) {
  return {
    id: item.id,
    paperVersionId: item.paperVersionId,
    sectionId: item.sectionId,
    questionNo: item.questionNo,
    itemType: item.itemType,
    stem: item.stem,
    answer: parseJson<{ choice?: string }>(item.answerKeyJson, {}),
    explanation: parseJson<{ zh?: string }>(item.explanationJson, {}),
    difficulty: item.difficulty,
    orderIndex: item.orderIndex,
    options:
      item.options?.map((option) => ({
        id: option.id,
        optionKey: option.optionKey,
        optionText: option.optionText,
        orderIndex: option.orderIndex,
      })) ?? [],
  };
}

export async function listPapers(userId: string) {
  const papers = await prisma.paper.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { items: true, attempts: true } } },
      },
      _count: { select: { attempts: true } },
    },
  });

  return papers.map((paper) => ({
    id: paper.id,
    title: paper.title,
    description: paper.description,
    sourceKey: paper.sourceKey,
    status: paper.status,
    createdAt: paper.createdAt,
    updatedAt: paper.updatedAt,
    attemptCount: paper._count.attempts,
    versions: paper.versions.map((version) => ({
      id: version.id,
      versionLabel: version.versionLabel,
      status: version.status,
      itemCount: version._count.items,
      attemptCount: version._count.attempts,
      publishedAt: version.publishedAt,
    })),
  }));
}

export async function createPaper(
  userId: string,
  input: { title: string; description?: string; sourceKey?: string },
) {
  const title = input.title.trim();
  if (!title) {
    throw new AppError("REQUEST_INVALID", "试卷标题不能为空。", 400);
  }

  return prisma.paper.create({
    data: {
      userId,
      title,
      description: optionalText(input.description),
      sourceKey: optionalText(input.sourceKey),
    },
  });
}

export async function getPaperDetail(userId: string, paperId: string) {
  const paper = await prisma.paper.findFirst({
    where: { id: paperId, userId },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
        include: {
          sections: { orderBy: { orderIndex: "asc" } },
          items: {
            orderBy: { orderIndex: "asc" },
            include: { options: { orderBy: { orderIndex: "asc" } } },
          },
          _count: { select: { attempts: true } },
        },
      },
    },
  });

  if (!paper) {
    throw new AppError("REQUEST_INVALID", "试卷不存在。", 404);
  }

  return {
    ...paper,
    versions: paper.versions.map((version) => ({
      ...version,
      items: version.items.map(serializeQuestionItem),
    })),
  };
}

export async function createPaperVersion(
  userId: string,
  paperId: string,
  input: { versionLabel: string; defaultDurationSeconds?: number },
) {
  const versionLabel = input.versionLabel.trim();
  if (!versionLabel) {
    throw new AppError("REQUEST_INVALID", "版本名称不能为空。", 400);
  }

  const paper = await prisma.paper.findFirst({ where: { id: paperId, userId } });
  if (!paper) {
    throw new AppError("REQUEST_INVALID", "试卷不存在。", 404);
  }

  return prisma.paperVersion.create({
    data: {
      paperId,
      versionLabel,
      defaultDurationSeconds:
        input.defaultDurationSeconds && input.defaultDurationSeconds > 0
          ? Math.floor(input.defaultDurationSeconds)
          : defaultDurationSeconds,
    },
  });
}

export async function getPaperVersionDetail(userId: string, versionId: string) {
  const version = await prisma.paperVersion.findFirst({
    where: { id: versionId, paper: { userId } },
    include: {
      paper: true,
      sections: { orderBy: { orderIndex: "asc" } },
      items: {
        orderBy: { orderIndex: "asc" },
        include: { options: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });

  if (!version) {
    throw new AppError("REQUEST_INVALID", "试卷版本不存在。", 404);
  }

  return {
    ...version,
    items: version.items.map(serializeQuestionItem),
  };
}

export async function createPaperSection(
  userId: string,
  versionId: string,
  input: {
    title: string;
    sectionCode?: string;
    instructions?: string;
    orderIndex?: number;
  },
) {
  const version = await prisma.paperVersion.findFirst({
    where: { id: versionId, paper: { userId } },
  });
  if (!version) {
    throw new AppError("REQUEST_INVALID", "试卷版本不存在。", 404);
  }
  ensureDraftStatus(version.status);

  const title = input.title.trim();
  if (!title) {
    throw new AppError("REQUEST_INVALID", "分区标题不能为空。", 400);
  }

  const orderIndex =
    input.orderIndex ??
    (await prisma.paperSection.count({ where: { paperVersionId: versionId } })) +
      1;

  return prisma.paperSection.create({
    data: {
      paperVersionId: versionId,
      title,
      sectionCode: optionalText(input.sectionCode),
      instructions: optionalText(input.instructions),
      orderIndex,
    },
  });
}

export async function deletePaperSection(userId: string, sectionId: string) {
  const section = await prisma.paperSection.findFirst({
    where: { id: sectionId, paperVersion: { paper: { userId } } },
    include: { paperVersion: true },
  });
  if (!section) {
    throw new AppError("REQUEST_INVALID", "分区不存在。", 404);
  }
  ensureDraftStatus(section.paperVersion.status);

  await prisma.paperSection.delete({ where: { id: sectionId } });
  return { deleted: true };
}

export async function createQuestionItem(
  userId: string,
  versionId: string,
  input: QuestionItemInput,
) {
  ensureSingleChoiceInput(input);

  const version = await prisma.paperVersion.findFirst({
    where: { id: versionId, paper: { userId } },
  });
  if (!version) {
    throw new AppError("REQUEST_INVALID", "试卷版本不存在。", 404);
  }
  ensureDraftStatus(version.status);

  if (input.sectionId) {
    const section = await prisma.paperSection.findFirst({
      where: { id: input.sectionId, paperVersionId: versionId },
    });
    if (!section) {
      throw new AppError("REQUEST_INVALID", "分区不存在。", 404);
    }
  }

  const options = normalizeOptions(input.options);
  const orderIndex =
    input.orderIndex ??
    (await prisma.questionItem.count({ where: { paperVersionId: versionId } })) +
      1;

  return prisma.questionItem.create({
    data: {
      paperVersionId: versionId,
      sectionId: input.sectionId || null,
      questionNo: input.questionNo.trim(),
      itemType: "single_choice",
      stem: input.stem.trim(),
      answerKeyJson: answerKeyJson(input.answerChoice),
      explanationJson: explanationJson(input.explanationZh),
      difficulty: optionalText(input.difficulty),
      orderIndex,
      options: options
        ? {
            create: options,
          }
        : undefined,
    },
    include: { options: { orderBy: { orderIndex: "asc" } } },
  });
}

export async function updateQuestionItem(
  userId: string,
  itemId: string,
  input: Partial<QuestionItemInput>,
) {
  const item = await prisma.questionItem.findFirst({
    where: { id: itemId, paperVersion: { paper: { userId } } },
    include: { paperVersion: true },
  });
  if (!item) {
    throw new AppError("REQUEST_INVALID", "题目不存在。", 404);
  }
  ensureDraftStatus(item.paperVersion.status);

  if (input.sectionId) {
    const section = await prisma.paperSection.findFirst({
      where: { id: input.sectionId, paperVersionId: item.paperVersionId },
    });
    if (!section) {
      throw new AppError("REQUEST_INVALID", "分区不存在。", 404);
    }
  }

  const answerChoice = input.answerChoice
    ? answerKeyJson(input.answerChoice)
    : undefined;
  const options = normalizeOptions(input.options);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.questionItem.update({
      where: { id: itemId },
      data: {
        sectionId: input.sectionId === undefined ? undefined : input.sectionId,
        questionNo: input.questionNo?.trim(),
        stem: input.stem?.trim(),
        answerKeyJson: answerChoice,
        explanationJson:
          input.explanationZh === undefined
            ? undefined
            : explanationJson(input.explanationZh),
        difficulty:
          input.difficulty === undefined ? undefined : optionalText(input.difficulty),
        orderIndex: input.orderIndex,
      },
    });

    if (options) {
      for (const option of options) {
        await tx.questionOption.upsert({
          where: {
            itemId_optionKey: {
              itemId,
              optionKey: option.optionKey,
            },
          },
          create: { itemId, ...option },
          update: {
            optionText: option.optionText,
            orderIndex: option.orderIndex,
          },
        });
      }
    }

    return tx.questionItem.findUniqueOrThrow({
      where: { id: updated.id },
      include: { options: { orderBy: { orderIndex: "asc" } } },
    });
  });
}

export async function deleteQuestionItem(userId: string, itemId: string) {
  const item = await prisma.questionItem.findFirst({
    where: { id: itemId, paperVersion: { paper: { userId } } },
    include: { paperVersion: true },
  });
  if (!item) {
    throw new AppError("REQUEST_INVALID", "题目不存在。", 404);
  }
  ensureDraftStatus(item.paperVersion.status);

  await prisma.questionItem.delete({ where: { id: itemId } });
  return { deleted: true };
}

export async function deleteQuestionOption(userId: string, optionId: string) {
  const option = await prisma.questionOption.findFirst({
    where: { id: optionId, item: { paperVersion: { paper: { userId } } } },
    include: { item: { include: { paperVersion: true } } },
  });
  if (!option) {
    throw new AppError("REQUEST_INVALID", "选项不存在。", 404);
  }
  ensureDraftStatus(option.item.paperVersion.status);

  await prisma.questionOption.delete({ where: { id: optionId } });
  return { deleted: true };
}

export async function publishPaperVersion(userId: string, versionId: string) {
  const version = await prisma.paperVersion.findFirst({
    where: { id: versionId, paper: { userId } },
    include: { items: { include: { options: true } } },
  });
  if (!version) {
    throw new AppError("REQUEST_INVALID", "试卷版本不存在。", 404);
  }
  ensureDraftStatus(version.status);

  if (version.items.length === 0) {
    throw new AppError("PUBLISH_INVALID", "至少需要 1 道题才能发布。", 400);
  }

  for (const item of version.items) {
    if (item.itemType !== "single_choice") {
      throw new AppError("PUBLISH_INVALID", "首版只支持 single_choice。", 400);
    }

    const optionSet = new Set(item.options.map((option) => option.optionKey));
    const hasAllOptions = optionKeys.every((optionKey) => optionSet.has(optionKey));
    if (!hasAllOptions) {
      throw new AppError(
        "PUBLISH_INVALID",
        `题目 ${item.questionNo} 必须包含 A-D 四个选项。`,
        400,
      );
    }

    const answerChoice = readAnswerChoice(item.answerKeyJson);
    if (!optionSet.has(answerChoice)) {
      throw new AppError(
        "PUBLISH_INVALID",
        `题目 ${item.questionNo} 的答案必须命中已有选项。`,
        400,
      );
    }
  }

  return prisma.paperVersion.update({
    where: { id: versionId },
    data: { status: "published", publishedAt: new Date() },
  });
}

export async function createAttempt(
  userId: string,
  versionId: string,
  input: { durationSeconds?: number; mode?: string; forceNew?: boolean } = {},
) {
  const version = await prisma.paperVersion.findFirst({
    where: { id: versionId, paper: { userId } },
    include: { paper: true },
  });
  if (!version) {
    throw new AppError("REQUEST_INVALID", "试卷版本不存在。", 404);
  }
  if (version.status !== "published") {
    throw new AppError("VERSION_NOT_PUBLISHED", "只能练习已发布版本。", 409);
  }

  if (!input.forceNew) {
    const reusableAttempt = await prisma.attempt.findFirst({
      where: {
        userId,
        paperVersionId: versionId,
        status: "in_progress",
        expiresAt: { gt: new Date() },
      },
      orderBy: { startedAt: "desc" },
    });
    if (reusableAttempt) {
      return reusableAttempt;
    }
  }

  const startedAt = new Date();
  const durationSeconds =
    input.durationSeconds && input.durationSeconds > 0
      ? Math.floor(input.durationSeconds)
      : version.defaultDurationSeconds || defaultDurationSeconds;
  const expiresAt = new Date(startedAt.getTime() + durationSeconds * 1000);

  return prisma.attempt.create({
    data: {
      userId,
      paperId: version.paperId,
      paperVersionId: version.id,
      mode: input.mode?.trim() || "exam",
      startedAt,
      durationSeconds,
      expiresAt,
    },
  });
}

export async function saveAttemptResponse(
  userId: string,
  attemptId: string,
  itemId: string,
  input: { choice: string; timeSpentSeconds?: number },
) {
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId },
  });
  if (!attempt) {
    throw new AppError("REQUEST_INVALID", "作答会话不存在。", 404);
  }
  if (attempt.status !== "in_progress") {
    throw new AppError("ATTEMPT_NOT_EDITABLE", "已提交的作答不能继续保存。", 409);
  }

  const item = await prisma.questionItem.findFirst({
    where: { id: itemId, paperVersionId: attempt.paperVersionId },
  });
  if (!item) {
    throw new AppError("REQUEST_INVALID", "题目不属于当前作答会话。", 404);
  }

  const choice = normalizeOptionKey(input.choice);
  assertOptionKey(choice);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const response = await tx.attemptResponse.upsert({
      where: { attemptId_itemId: { attemptId, itemId } },
      create: {
        attemptId,
        itemId,
        answerJson: JSON.stringify({ choice }),
        timeSpentSeconds: Math.max(0, input.timeSpentSeconds ?? 0),
        autosavedAt: now,
      },
      update: {
        answerJson: JSON.stringify({ choice }),
        timeSpentSeconds: Math.max(0, input.timeSpentSeconds ?? 0),
        autosavedAt: now,
      },
    });

    await tx.attempt.update({
      where: { id: attemptId },
      data: { lastAutosavedAt: now },
    });

    return response;
  });
}

async function buildAttemptReport(userId: string, attemptId: string) {
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      paper: true,
      paperVersion: true,
      gradingResult: true,
      responses: true,
    },
  });

  if (!attempt) {
    throw new AppError("REQUEST_INVALID", "作答会话不存在。", 404);
  }

  const items = await prisma.questionItem.findMany({
    where: { paperVersionId: attempt.paperVersionId },
    orderBy: { orderIndex: "asc" },
    include: { options: { orderBy: { orderIndex: "asc" } } },
  });
  const responsesByItem = new Map(
    attempt.responses.map((response) => [response.itemId, response]),
  );

  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      durationSeconds: attempt.durationSeconds,
      expiresAt: attempt.expiresAt,
      submittedAt: attempt.submittedAt,
      lastAutosavedAt: attempt.lastAutosavedAt,
      timedOut: new Date() > attempt.expiresAt,
    },
    paper: {
      id: attempt.paper.id,
      title: attempt.paper.title,
    },
    version: {
      id: attempt.paperVersion.id,
      versionLabel: attempt.paperVersion.versionLabel,
    },
    summary: attempt.gradingResult,
    items: items.map((item) => {
      const response = responsesByItem.get(item.id);
      return {
        ...serializeQuestionItem(item),
        response: response
          ? {
              id: response.id,
              answer: parseJson<{ choice?: string }>(response.answerJson, {}),
              isCorrect: response.isCorrect,
              score: response.score,
              gradedAt: response.gradedAt,
            }
          : null,
      };
    }),
  };
}

export async function getAttemptReport(userId: string, attemptId: string) {
  return buildAttemptReport(userId, attemptId);
}

export async function submitAttempt(userId: string, attemptId: string) {
  const existing = await prisma.gradingResult.findFirst({
    where: { attempt: { id: attemptId, userId } },
  });
  if (existing) {
    return buildAttemptReport(userId, attemptId);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const attempt = await tx.attempt.findFirst({
        where: { id: attemptId, userId },
        include: {
          responses: true,
          paperVersion: {
            include: {
              items: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      });

      if (!attempt) {
        throw new AppError("REQUEST_INVALID", "作答会话不存在。", 404);
      }

      if (attempt.status === "submitted") {
        return;
      }

      const now = new Date();
      const responsesByItem = new Map(
        attempt.responses.map((response) => [response.itemId, response]),
      );
      let answeredItems = 0;
      let correctItems = 0;

      for (const item of attempt.paperVersion.items) {
        const response = responsesByItem.get(item.id);
        const userChoice = response
          ? parseJson<{ choice?: string }>(response.answerJson, {}).choice
          : undefined;
        const correctChoice = readAnswerChoice(item.answerKeyJson);
        const isCorrect = userChoice === correctChoice;

        if (response) {
          answeredItems += 1;
          if (isCorrect) {
            correctItems += 1;
          }

          await tx.attemptResponse.update({
            where: { id: response.id },
            data: {
              isCorrect,
              score: isCorrect ? 1 : 0,
              gradedAt: now,
            },
          });
        }
      }

      const totalItems = attempt.paperVersion.items.length;
      const wrongItems = answeredItems - correctItems;
      const score = correctItems;
      const accuracy = totalItems > 0 ? correctItems / totalItems : 0;

      await tx.gradingResult.create({
        data: {
          attemptId,
          totalItems,
          answeredItems,
          correctItems,
          wrongItems,
          score,
          accuracy,
          gradedAt: now,
        },
      });

      await tx.attempt.update({
        where: { id: attemptId },
        data: {
          status: "submitted",
          submittedAt: now,
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return buildAttemptReport(userId, attemptId);
    }

    throw error;
  }

  return buildAttemptReport(userId, attemptId);
}
