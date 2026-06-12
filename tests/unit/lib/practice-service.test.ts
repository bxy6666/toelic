import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import { recordPracticeAnswer } from "@/lib/practice-service";

const prismaMocks = vi.hoisted(() => ({
  questionFindUnique: vi.fn(),
  practiceRecordCreate: vi.fn(),
}));

const mistakeMocks = vi.hoisted(() => ({
  createOrUpdateMistake: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    question: {
      findUnique: prismaMocks.questionFindUnique,
    },
    practiceRecord: {
      create: prismaMocks.practiceRecordCreate,
    },
  },
}));

vi.mock("@/lib/mistake-service", () => ({
  createOrUpdateMistake: mistakeMocks.createOrUpdateMistake,
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

beforeEach(() => {
  prismaMocks.questionFindUnique.mockResolvedValue(question);
  prismaMocks.practiceRecordCreate.mockResolvedValue({
    id: "record-1",
    questionId: "question-1",
  });
  mistakeMocks.createOrUpdateMistake.mockResolvedValue({ id: "mistake-1" });
});

describe("recordPracticeAnswer", () => {
  it("normalizes lowercase answers and records a correct answer", async () => {
    const result = await recordPracticeAnswer({
      questionId: "question-1",
      userAnswer: " b ",
      timeSpentSeconds: 12,
    });

    expect(prismaMocks.practiceRecordCreate).toHaveBeenCalledWith({
      data: {
        questionId: "question-1",
        practiceType: "grammar",
        userAnswer: "B",
        isCorrect: true,
        timeSpentSeconds: 12,
      },
    });
    expect(mistakeMocks.createOrUpdateMistake).not.toHaveBeenCalled();
    expect(result.result).toMatchObject({
      userAnswer: "B",
      correctAnswer: "B",
      isCorrect: true,
      options: { A: "A", B: "B", C: "C", D: "D" },
      tags: ["tense"],
    });
  });

  it("rejects answers outside A-D", async () => {
    await expect(
      recordPracticeAnswer({ questionId: "question-1", userAnswer: "E" }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("returns a request error when the question does not exist", async () => {
    prismaMocks.questionFindUnique.mockResolvedValue(null);

    await expect(
      recordPracticeAnswer({ questionId: "missing", userAnswer: "A" }),
    ).rejects.toMatchObject({ code: "REQUEST_INVALID", status: 404 });
  });

  it("creates or updates a mistake for wrong answers", async () => {
    const result = await recordPracticeAnswer({
      questionId: "question-1",
      userAnswer: "A",
      timeSpentSeconds: 5,
    });

    expect(mistakeMocks.createOrUpdateMistake).toHaveBeenCalledWith("question-1");
    expect(result.mistake).toEqual({ id: "mistake-1" });
    expect(result.result.isCorrect).toBe(false);
  });

  it("clamps negative time spent to zero", async () => {
    await recordPracticeAnswer({
      questionId: "question-1",
      userAnswer: "B",
      timeSpentSeconds: -30,
    });

    expect(prismaMocks.practiceRecordCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ timeSpentSeconds: 0 }),
      }),
    );
  });
});
