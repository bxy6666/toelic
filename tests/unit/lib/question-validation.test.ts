import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors";
import { parseAndValidateQuestions } from "@/lib/question-validation";

const grammarQuestion = {
  type: "grammar",
  subtype: "sentence-completion",
  difficulty: "medium",
  prompt: "The manager _____ the report yesterday.",
  options: {
    A: "review",
    B: "reviewed",
    C: "reviews",
    D: "reviewing",
  },
  answer: "B",
  explanationZh: "此处需要一般过去时。",
  grammarPoint: "tense",
  tags: ["tense", "business"],
};

const listeningQuestion = {
  type: "listening",
  subtype: "picture-description",
  difficulty: "easy",
  prompt: "Look at the picture and choose the best description.",
  listeningScript: "A man is arranging documents on a table.",
  options: {
    A: "A man is arranging documents.",
    B: "A woman is driving a car.",
    C: "People are boarding a train.",
    D: "A printer is being repaired.",
  },
  answer: "A",
  explanationZh: "图片中男子正在整理文件。",
  imagePrompt: "A business worker arranging documents on a table, no text.",
  tags: ["picture", "office"],
};

function wrap(question: unknown) {
  return JSON.stringify({ questions: [question] });
}

describe("parseAndValidateQuestions", () => {
  it("parses valid grammar questions", () => {
    const questions = parseAndValidateQuestions(
      wrap(grammarQuestion),
      "grammar",
      "sentence-completion",
    );

    expect(questions).toHaveLength(1);
    expect(questions[0]).toMatchObject({
      type: "grammar",
      subtype: "sentence-completion",
      answer: "B",
      grammarPoint: "tense",
    });
  });

  it("accepts a response wrapped in a single JSON code fence", () => {
    const questions = parseAndValidateQuestions(
      `\`\`\`json\n${wrap(grammarQuestion)}\n\`\`\``,
      "grammar",
      "sentence-completion",
    );

    expect(questions[0].prompt).toBe(grammarQuestion.prompt);
  });

  it("rejects markdown mixed with JSON text", () => {
    expect(() =>
      parseAndValidateQuestions(
        `Here is JSON:\n\`\`\`json\n${wrap(grammarQuestion)}\n\`\`\``,
        "grammar",
        "sentence-completion",
      ),
    ).toThrow(AppError);
  });

  it("rejects payloads without a questions array", () => {
    expect(() =>
      parseAndValidateQuestions("{}", "grammar", "sentence-completion"),
    ).toThrow(AppError);
  });

  it("rejects missing or duplicated options", () => {
    expect(() =>
      parseAndValidateQuestions(
        wrap({
          ...grammarQuestion,
          options: { A: "same", B: "same", C: "third", D: "fourth" },
        }),
        "grammar",
        "sentence-completion",
      ),
    ).toThrow(AppError);
  });

  it("rejects an answer outside A-D", () => {
    expect(() =>
      parseAndValidateQuestions(
        wrap({ ...grammarQuestion, answer: "E" }),
        "grammar",
        "sentence-completion",
      ),
    ).toThrow(AppError);
  });

  it("rejects unsupported difficulty values", () => {
    expect(() =>
      parseAndValidateQuestions(
        wrap({ ...grammarQuestion, difficulty: "expert" }),
        "grammar",
        "sentence-completion",
      ),
    ).toThrow(AppError);
  });

  it("throws a subtype mismatch error when the model changes the requested subtype", () => {
    expect(() =>
      parseAndValidateQuestions(
        wrap({ ...grammarQuestion, subtype: "business-context" }),
        "grammar",
        "sentence-completion",
      ),
    ).toThrow(/QUESTION_SUBTYPE_MISMATCH|题型|subtype/i);
  });

  it("requires listening scripts for listening questions", () => {
    expect(() =>
      parseAndValidateQuestions(
        wrap({ ...listeningQuestion, listeningScript: "" }),
        "listening",
        "picture-description",
      ),
    ).toThrow(AppError);
  });

  it("requires image prompts for picture-description listening questions", () => {
    expect(() =>
      parseAndValidateQuestions(
        wrap({ ...listeningQuestion, imagePrompt: "" }),
        "listening",
        "picture-description",
      ),
    ).toThrow(AppError);
  });
});
