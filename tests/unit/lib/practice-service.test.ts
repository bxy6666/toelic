import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import { recordPracticeAnswer } from "@/lib/practice-service";

const prismaMocks = vi.hoisted(() => ({
  questionFindFirst: vi.fn(),
  practiceRecordCreate: vi.fn(),
  mistakeUpsert: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    question: {
      findFirst: prismaMocks.questionFindFirst,
    },
    $transaction: prismaMocks.transaction,
  },
}));

const question = {
  id: "question-1",
  type: "grammar",
  answer: "B",
  explanationZh: "Because B is correct.",
  optionsJson: JSON.stringify({ A: "A", B: "B", C: "C", D: "D" }),
  tagsJson: JSON.stringify(["tense"]),
  listeningScript: null,
  grammarPoint: "tense",
};

function answerInput(
  overrides: Partial<Parameters<typeof recordPracticeAnswer>[0]> = {},
) {
  return {
    userId: "user-1",
    questionId: "question-1",
    userAnswer: "B",
    ...overrides,
  };
}

function setUpTransactionMock() {
  prismaMocks.transaction.mockImplementation(
    async (
      callback: (tx: {
        practiceRecord: { create: typeof prismaMocks.practiceRecordCreate };
        mistake: { upsert: typeof prismaMocks.mistakeUpsert };
      }) => Promise<unknown>,
    ) =>
      callback({
        practiceRecord: { create: prismaMocks.practiceRecordCreate },
        mistake: { upsert: prismaMocks.mistakeUpsert },
      }),
  );
}

function setUp() {
  prismaMocks.questionFindFirst.mockResolvedValue(question);
  prismaMocks.practiceRecordCreate.mockResolvedValue({
    id: "record-1",
    questionId: "question-1",
  });
  prismaMocks.mistakeUpsert.mockResolvedValue({ id: "mistake-1" });
  setUpTransactionMock();
}

beforeEach(setUp);

describe("Acceptance: recordPracticeAnswer", () => {
  it("Scenario: lowercase answers are normalized and recorded as correct", async () => {
    const result = await recordPracticeAnswer(
      answerInput({
        userAnswer: " b ",
        timeSpentSeconds: 12,
      }),
    );

    expect(prismaMocks.practiceRecordCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        questionId: "question-1",
        practiceType: "grammar",
        userAnswer: "B",
        isCorrect: true,
        timeSpentSeconds: 12,
      },
    });
    expect(prismaMocks.mistakeUpsert).not.toHaveBeenCalled();
    expect(result.result).toMatchObject({
      userAnswer: "B",
      correctAnswer: "B",
      isCorrect: true,
      options: { A: "A", B: "B", C: "C", D: "D" },
      tags: ["tense"],
    });
  });

  it("Scenario: answers outside A-D are rejected before saving", async () => {
    await expect(
      recordPracticeAnswer(
        answerInput({
          userAnswer: "E",
        }),
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("Scenario: missing questions return a 404 request error", async () => {
    prismaMocks.questionFindFirst.mockResolvedValue(null);

    await expect(
      recordPracticeAnswer(
        answerInput({
          questionId: "missing",
          userAnswer: "A",
        }),
      ),
    ).rejects.toMatchObject({ code: "REQUEST_INVALID", status: 404 });
  });

  it("Scenario: wrong answers create or update the mistake record", async () => {
    const result = await recordPracticeAnswer(
      answerInput({
        userAnswer: "A",
        timeSpentSeconds: 5,
      }),
    );

    expect(prismaMocks.mistakeUpsert).toHaveBeenCalledWith({
      where: { questionId: "question-1" },
      create: expect.objectContaining({
        userId: "user-1",
        questionId: "question-1",
        wrongCount: 1,
      }),
      update: expect.objectContaining({
        userId: "user-1",
        wrongCount: { increment: 1 },
      }),
    });
    expect(result.mistake).toEqual({ id: "mistake-1" });
    expect(result.result.isCorrect).toBe(false);
  });

  it("Scenario: negative time spent is clamped to zero", async () => {
    await recordPracticeAnswer(
      answerInput({
        userAnswer: "B",
        timeSpentSeconds: -30,
      }),
    );

    expect(prismaMocks.practiceRecordCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ timeSpentSeconds: 0 }),
      }),
    );
  });
});
