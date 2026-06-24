import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import {
  attachImagesToPictureDescriptionQuestions,
  buildQuestionPrompt,
  generateQuestionsWithMaas,
  type QuestionGenerationRequest,
  type ValidatedQuestion,
} from "@/lib/question-generation";

const maasMocks = vi.hoisted(() => ({
  generateTextWithMaas: vi.fn(),
}));

const validationMocks = vi.hoisted(() => ({
  parseAndValidateQuestions: vi.fn(),
}));

const imageMocks = vi.hoisted(() => ({
  generateImageDataUrl: vi.fn(),
}));

vi.mock("@/lib/maas-client", () => ({
  generateTextWithMaas: maasMocks.generateTextWithMaas,
}));

vi.mock("@/lib/question-validation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/question-validation")>();
  return {
    ...actual,
    parseAndValidateQuestions: validationMocks.parseAndValidateQuestions,
  };
});

vi.mock("@/lib/image-generation", () => ({
  generateImageDataUrl: imageMocks.generateImageDataUrl,
}));

const grammarRequest: QuestionGenerationRequest = {
  practiceType: "grammar",
  subtype: "sentence-completion",
  difficulty: "medium",
  count: 1,
  tags: ["tense"],
  grammarPoint: "tense",
};

const listeningRequest: QuestionGenerationRequest = {
  practiceType: "listening",
  subtype: "picture-description",
  difficulty: "easy",
  count: 1,
  tags: ["picture"],
};

const validQuestion: ValidatedQuestion = {
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

// Equivalent to JUnit @Before: prepare shared service mocks.
function setUp() {
  maasMocks.generateTextWithMaas.mockResolvedValue("{\"questions\":[]}");
  validationMocks.parseAndValidateQuestions.mockReturnValue([validQuestion]);
  imageMocks.generateImageDataUrl.mockResolvedValue("data:image/png;base64,abc");
}

beforeEach(setUp);

describe("question-generation", () => {
  it("builds grammar and listening prompts from the request type", () => {
    expect(buildQuestionPrompt(grammarRequest)).toContain("sentence-completion");
    expect(buildQuestionPrompt(grammarRequest)).toContain("tense");
    expect(buildQuestionPrompt(listeningRequest)).toContain("picture-description");
    expect(buildQuestionPrompt(listeningRequest)).toContain("imagePrompt");
  });

  it("generates questions through MaaS and validates the strict JSON result", async () => {
    await expect(generateQuestionsWithMaas(grammarRequest)).resolves.toEqual([
      validQuestion,
    ]);
    expect(maasMocks.generateTextWithMaas).toHaveBeenCalledWith([
      expect.objectContaining({ role: "system" }),
      expect.objectContaining({ role: "user" }),
    ]);
    expect(validationMocks.parseAndValidateQuestions).toHaveBeenCalledWith(
      "{\"questions\":[]}",
      "grammar",
      "sentence-completion",
    );
  });

  it("retries once when the model returns a mismatched subtype", async () => {
    validationMocks.parseAndValidateQuestions
      .mockImplementationOnce(() => {
        throw new AppError("QUESTION_SUBTYPE_MISMATCH", "Mismatch", 502);
      })
      .mockReturnValueOnce([validQuestion]);

    await expect(generateQuestionsWithMaas(grammarRequest)).resolves.toEqual([
      validQuestion,
    ]);
    expect(maasMocks.generateTextWithMaas).toHaveBeenCalledTimes(2);
  });

  it("does not retry ordinary validation errors", async () => {
    validationMocks.parseAndValidateQuestions.mockImplementation(() => {
      throw new AppError("QUESTION_VALIDATION_FAILED", "Invalid", 502);
    });

    await expect(generateQuestionsWithMaas(grammarRequest)).rejects.toMatchObject({
      code: "QUESTION_VALIDATION_FAILED",
    });
    expect(maasMocks.generateTextWithMaas).toHaveBeenCalledTimes(1);
  });

  it("attaches generated images only for picture-description listening questions", async () => {
    const questionWithPrompt: ValidatedQuestion = {
      ...validQuestion,
      type: "listening",
      subtype: "picture-description",
      listeningScript: "Script",
      grammarPoint: undefined,
      imagePrompt: "Office worker arranging documents",
    };

    const questions = await attachImagesToPictureDescriptionQuestions(
      listeningRequest,
      [questionWithPrompt],
    );

    expect(imageMocks.generateImageDataUrl).toHaveBeenCalledWith(
      "Office worker arranging documents",
    );
    expect(questions[0].imageUrl).toBe("data:image/png;base64,abc");

    await expect(
      attachImagesToPictureDescriptionQuestions(grammarRequest, [validQuestion]),
    ).resolves.toEqual([validQuestion]);
  });

  it("fails picture-description image attachment when imagePrompt is missing", async () => {
    await expect(
      attachImagesToPictureDescriptionQuestions(listeningRequest, [
        {
          ...validQuestion,
          type: "listening",
          subtype: "picture-description",
          listeningScript: "Script",
          grammarPoint: undefined,
        },
      ]),
    ).rejects.toMatchObject({ code: "QUESTION_VALIDATION_FAILED" });
  });
});
