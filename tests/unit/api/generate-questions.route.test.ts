import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

const generationMocks = vi.hoisted(() => ({
  generateQuestionsWithMaas: vi.fn(),
  attachImagesToPictureDescriptionQuestions: vi.fn(),
}));

const prismaMocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  questionCreate: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  requireUserFromRequest: vi.fn(),
}));

const usageMocks = vi.hoisted(() => ({
  assertGenerationAllowed: vi.fn(),
  recordGenerationUsage: vi.fn(),
}));

const imageStorageMocks = vi.hoisted(() => ({
  persistQuestionImages: vi.fn(),
}));

vi.mock("@/lib/question-generation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/question-generation")>();
  return {
    ...actual,
    generateQuestionsWithMaas: generationMocks.generateQuestionsWithMaas,
    attachImagesToPictureDescriptionQuestions:
      generationMocks.attachImagesToPictureDescriptionQuestions,
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    question: {
      create: prismaMocks.questionCreate,
    },
    $transaction: prismaMocks.transaction,
  },
}));

vi.mock("@/lib/auth", () => ({
  requireUserFromRequest: authMocks.requireUserFromRequest,
}));

vi.mock("@/lib/generation-usage", () => ({
  assertGenerationAllowed: usageMocks.assertGenerationAllowed,
  recordGenerationUsage: usageMocks.recordGenerationUsage,
}));

vi.mock("@/lib/image-storage", () => ({
  persistQuestionImages: imageStorageMocks.persistQuestionImages,
}));

const generatedQuestion = {
  type: "grammar",
  subtype: "sentence-completion",
  difficulty: "medium",
  prompt: "Prompt",
  options: { A: "A", B: "B", C: "C", D: "D" },
  answer: "A",
  explanationZh: "Explanation",
  tags: ["tense"],
  grammarPoint: "tense",
};

async function post(body: unknown) {
  const { POST } = await import("@/app/api/ai/generate-questions/route");

  return POST(
    new Request("http://localhost/api/ai/generate-questions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
}

async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

beforeEach(() => {
  authMocks.requireUserFromRequest.mockResolvedValue({
    id: "user-1",
    username: "admin",
  });
  usageMocks.assertGenerationAllowed.mockResolvedValue(undefined);
  usageMocks.recordGenerationUsage.mockResolvedValue(undefined);
  generationMocks.generateQuestionsWithMaas.mockResolvedValue([generatedQuestion]);
  generationMocks.attachImagesToPictureDescriptionQuestions.mockResolvedValue([
    generatedQuestion,
  ]);
  imageStorageMocks.persistQuestionImages.mockImplementation(
    async (questions: unknown[]) => questions,
  );
  prismaMocks.questionCreate.mockResolvedValue({
    id: "question-1",
    ...generatedQuestion,
    optionsJson: JSON.stringify(generatedQuestion.options),
    tagsJson: JSON.stringify(generatedQuestion.tags),
    source: "maas",
  });
  prismaMocks.transaction.mockImplementation((operations: Promise<unknown>[]) =>
    Promise.all(operations),
  );
});

describe("POST /api/ai/generate-questions", () => {
  it("validates request bodies before generating questions", async () => {
    const response = await post({
      practiceType: "invalid",
      subtype: "sentence-completion",
      difficulty: "medium",
      count: 1,
    });
    const payload = await readJson(response);

    expect(response.status).toBe(400);
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "REQUEST_INVALID" },
    });
    expect(generationMocks.generateQuestionsWithMaas).not.toHaveBeenCalled();
  });

  it("saves generated questions and returns parsed options and tags", async () => {
    const response = await post({
      practiceType: "grammar",
      subtype: "sentence-completion",
      difficulty: "medium",
      count: 1,
      tags: [" tense ", "", 123, "grammar"],
      grammarPoint: "tense",
    });
    const payload = await readJson(response);

    expect(response.status).toBe(200);
    expect(generationMocks.generateQuestionsWithMaas).toHaveBeenCalledWith({
      practiceType: "grammar",
      subtype: "sentence-completion",
      difficulty: "medium",
      count: 1,
      tags: ["tense", "grammar"],
      grammarPoint: "tense",
    });
    expect(prismaMocks.questionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        optionsJson: JSON.stringify(generatedQuestion.options),
        tagsJson: JSON.stringify(generatedQuestion.tags),
        source: "maas",
        userId: "user-1",
      }),
    });
    expect(usageMocks.assertGenerationAllowed).toHaveBeenCalledWith("user-1", 1);
    expect(usageMocks.recordGenerationUsage).toHaveBeenCalledWith("user-1", 1);
    expect(payload).toMatchObject({
      ok: true,
      data: {
        questions: [
          expect.objectContaining({
            id: "question-1",
            options: generatedQuestion.options,
            tags: generatedQuestion.tags,
          }),
        ],
        source: "maas",
      },
    });
  });

  it("returns AppError responses from the generation layer", async () => {
    generationMocks.generateQuestionsWithMaas.mockRejectedValue(
      new AppError("QUESTION_VALIDATION_FAILED", "Invalid question", 502),
    );

    const response = await post({
      practiceType: "grammar",
      subtype: "sentence-completion",
      difficulty: "medium",
      count: 1,
    });
    const payload = await readJson(response);

    expect(response.status).toBe(502);
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "QUESTION_VALIDATION_FAILED" },
    });
  });

  it("rejects unauthenticated generation requests", async () => {
    authMocks.requireUserFromRequest.mockRejectedValue(
      new AppError("UNAUTHORIZED", "Login required", 401),
    );

    const response = await post({
      practiceType: "grammar",
      subtype: "sentence-completion",
      difficulty: "medium",
      count: 1,
    });
    const payload = await readJson(response);

    expect(response.status).toBe(401);
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "UNAUTHORIZED" },
    });
    expect(generationMocks.generateQuestionsWithMaas).not.toHaveBeenCalled();
  });
});
