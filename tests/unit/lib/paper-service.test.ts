import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import {
  createAttempt,
  publishPaperVersion,
  saveAttemptResponse,
  submitAttempt,
} from "@/lib/paper-service";

const prismaMocks = vi.hoisted(() => ({
  paperVersionFindFirst: vi.fn(),
  paperVersionUpdate: vi.fn(),
  attemptFindFirst: vi.fn(),
  attemptCreate: vi.fn(),
  attemptUpdate: vi.fn(),
  questionItemFindFirst: vi.fn(),
  questionItemFindMany: vi.fn(),
  attemptResponseUpsert: vi.fn(),
  gradingResultFindFirst: vi.fn(),
  gradingResultCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    paperVersion: {
      findFirst: prismaMocks.paperVersionFindFirst,
      update: prismaMocks.paperVersionUpdate,
    },
    attempt: {
      findFirst: prismaMocks.attemptFindFirst,
      create: prismaMocks.attemptCreate,
      update: prismaMocks.attemptUpdate,
    },
    questionItem: {
      findFirst: prismaMocks.questionItemFindFirst,
      findMany: prismaMocks.questionItemFindMany,
    },
    attemptResponse: {
      upsert: prismaMocks.attemptResponseUpsert,
    },
    gradingResult: {
      findFirst: prismaMocks.gradingResultFindFirst,
      create: prismaMocks.gradingResultCreate,
    },
    $transaction: prismaMocks.transaction,
  },
}));

const publishedVersion = {
  id: "version-1",
  paperId: "paper-1",
  status: "published",
  defaultDurationSeconds: 900,
  paper: { id: "paper-1", userId: "user-1" },
};

const reportAttempt = {
  id: "attempt-1",
  status: "submitted",
  startedAt: new Date("2030-01-01T00:00:00.000Z"),
  durationSeconds: 900,
  expiresAt: new Date("2030-01-01T00:15:00.000Z"),
  submittedAt: new Date("2030-01-01T00:05:00.000Z"),
  lastAutosavedAt: null,
  paper: { id: "paper-1", title: "Paper" },
  paperVersion: { id: "version-1", versionLabel: "v1" },
  gradingResult: {
    totalItems: 1,
    answeredItems: 1,
    correctItems: 1,
    wrongItems: 0,
    score: 1,
    accuracy: 1,
  },
  responses: [
    {
      id: "response-1",
      itemId: "item-1",
      answerJson: JSON.stringify({ choice: "B" }),
      isCorrect: true,
      score: 1,
      gradedAt: new Date("2030-01-01T00:05:00.000Z"),
    },
  ],
};

function setUpTransactionMock() {
  prismaMocks.transaction.mockImplementation(
    async (
      callback: (tx: {
        attemptResponse: { upsert: typeof prismaMocks.attemptResponseUpsert };
        attempt: {
          update: typeof prismaMocks.attemptUpdate;
          findFirst: typeof prismaMocks.attemptFindFirst;
        };
        gradingResult: { create: typeof prismaMocks.gradingResultCreate };
      }) => Promise<unknown>,
    ) =>
      callback({
        attemptResponse: { upsert: prismaMocks.attemptResponseUpsert },
        attempt: {
          update: prismaMocks.attemptUpdate,
          findFirst: prismaMocks.attemptFindFirst,
        },
        gradingResult: { create: prismaMocks.gradingResultCreate },
      }),
  );
}

function setUpReportMocks() {
  prismaMocks.attemptFindFirst.mockResolvedValue(reportAttempt);
  prismaMocks.questionItemFindMany.mockResolvedValue([
    {
      id: "item-1",
      paperVersionId: "version-1",
      sectionId: null,
      questionNo: "101",
      itemType: "single_choice",
      stem: "Stem",
      answerKeyJson: JSON.stringify({ choice: "B" }),
      explanationJson: JSON.stringify({ zh: "解析" }),
      difficulty: "easy",
      orderIndex: 1,
      options: [
        { id: "option-1", optionKey: "B", optionText: "by", orderIndex: 2 },
      ],
    },
  ]);
}

function setUp() {
  vi.clearAllMocks();
  setUpTransactionMock();
}

beforeEach(setUp);

describe("Acceptance: paper-domain service", () => {
  it("Scenario: publishing rejects non-draft versions", async () => {
    prismaMocks.paperVersionFindFirst.mockResolvedValue({
      id: "version-1",
      status: "published",
      items: [],
    });

    await expect(publishPaperVersion("user-1", "version-1")).rejects.toMatchObject(
      {
        code: "VERSION_NOT_EDITABLE",
      },
    );
  });

  it("Scenario: publishing validates A-D options before release", async () => {
    prismaMocks.paperVersionFindFirst.mockResolvedValue({
      id: "version-1",
      status: "draft",
      items: [
        {
          questionNo: "101",
          itemType: "single_choice",
          answerKeyJson: JSON.stringify({ choice: "A" }),
          options: [{ optionKey: "A" }],
        },
      ],
    });

    await expect(publishPaperVersion("user-1", "version-1")).rejects.toBeInstanceOf(
      AppError,
    );
    await expect(publishPaperVersion("user-1", "version-1")).rejects.toMatchObject(
      {
        code: "PUBLISH_INVALID",
      },
    );
  });

  it("Scenario: attempt creation requires a published version", async () => {
    prismaMocks.paperVersionFindFirst.mockResolvedValue({
      ...publishedVersion,
      status: "draft",
    });

    await expect(createAttempt("user-1", "version-1")).rejects.toMatchObject({
      code: "VERSION_NOT_PUBLISHED",
    });
  });

  it("Scenario: attempt response upserts the answer and refreshes autosave time", async () => {
    prismaMocks.attemptFindFirst.mockResolvedValue({
      id: "attempt-1",
      paperVersionId: "version-1",
      status: "in_progress",
    });
    prismaMocks.questionItemFindFirst.mockResolvedValue({ id: "item-1" });
    prismaMocks.attemptResponseUpsert.mockResolvedValue({ id: "response-1" });

    await saveAttemptResponse("user-1", "attempt-1", "item-1", {
      choice: "b",
      timeSpentSeconds: 12,
    });

    expect(prismaMocks.attemptResponseUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { attemptId_itemId: { attemptId: "attempt-1", itemId: "item-1" } },
        create: expect.objectContaining({
          answerJson: JSON.stringify({ choice: "B" }),
          timeSpentSeconds: 12,
        }),
      }),
    );
    expect(prismaMocks.attemptUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "attempt-1" },
        data: expect.objectContaining({ lastAutosavedAt: expect.any(Date) }),
      }),
    );
  });

  it("Scenario: repeated submit returns the existing grading report", async () => {
    prismaMocks.gradingResultFindFirst.mockResolvedValue({ id: "grade-1" });
    setUpReportMocks();

    const report = await submitAttempt("user-1", "attempt-1");

    expect(prismaMocks.transaction).not.toHaveBeenCalled();
    expect(report.summary).toMatchObject({ correctItems: 1, accuracy: 1 });
  });
});
