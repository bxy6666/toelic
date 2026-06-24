import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import {
  createPostJsonAction,
  expectErrorResponse,
  expectOkResponse,
  setUpAuthenticatedUser,
  setUpUnauthenticatedUser,
} from "../test-utils";

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

const defaultGenerationRequest = {
  practiceType: "grammar",
  subtype: "sentence-completion",
  difficulty: "medium",
  count: 1,
};

const post = createPostJsonAction(
  "http://localhost/api/ai/generate-questions",
  () => import("@/app/api/ai/generate-questions/route"),
);

function generationRequest(overrides: Record<string, unknown> = {}) {
  return {
    ...defaultGenerationRequest,
    ...overrides,
  };
}

function setUp() {
  setUpAuthenticatedUser(authMocks.requireUserFromRequest);
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
}

beforeEach(setUp);

describe("Acceptance: POST /api/ai/generate-questions", () => {
  it("Scenario: invalid request bodies are rejected before generation", async () => {
    const response = await post(
      generationRequest({
        practiceType: "invalid",
      }),
    );

    await expectErrorResponse(response, 400, "REQUEST_INVALID");
    expect(generationMocks.generateQuestionsWithMaas).not.toHaveBeenCalled();
  });

  it("Scenario: generated questions are saved with normalized tags", async () => {
    const response = await post(
      generationRequest({
        tags: [" tense ", "", 123, "grammar"],
        grammarPoint: "tense",
      }),
    );
    const payload = await expectOkResponse(response);

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

  it("Scenario: generation AppError responses keep their status and code", async () => {
    generationMocks.generateQuestionsWithMaas.mockRejectedValue(
      new AppError("QUESTION_VALIDATION_FAILED", "Invalid question", 502),
    );

    const response = await post(generationRequest());
    await expectErrorResponse(
      response,
      502,
      "QUESTION_VALIDATION_FAILED",
    );
  });

  it("Scenario: unauthenticated requests stop before generation starts", async () => {
    setUpUnauthenticatedUser(authMocks.requireUserFromRequest);

    const response = await post(generationRequest());
    await expectErrorResponse(response, 401, "UNAUTHORIZED");

    expect(generationMocks.generateQuestionsWithMaas).not.toHaveBeenCalled();
  });
});
