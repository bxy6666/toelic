import { beforeEach, describe, expect, it, vi } from "vitest";

import { completeMissingAnswersWithMaas } from "@/lib/paper-import-ai";
import type { ImportedPaperDraft } from "@/lib/paper-import-parser";

const maasMocks = vi.hoisted(() => ({
  generateTextWithMaas: vi.fn(),
}));

vi.mock("@/lib/maas-client", () => ({
  generateTextWithMaas: maasMocks.generateTextWithMaas,
}));

const draft: ImportedPaperDraft = {
  title: "Sample",
  sourceKey: "sample",
  versionLabel: "v1",
  sections: [{ sectionCode: "imported", title: "Imported", orderIndex: 1 }],
  items: [
    {
      questionNo: "101",
      stem: "The report must be ___ before Friday.",
      options: [
        { optionKey: "A", optionText: "submit", orderIndex: 1 },
        { optionKey: "B", optionText: "submitted", orderIndex: 2 },
        { optionKey: "C", optionText: "submitting", orderIndex: 3 },
        { optionKey: "D", optionText: "submission", orderIndex: 4 },
      ],
      answerSource: "missing",
      orderIndex: 1,
      confidence: 0.5,
    },
  ],
  missingAnswerCount: 1,
  parserName: "rule-text-v1",
  confidence: 0.5,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("paper import AI helper", () => {
  it("fills missing answers and marks them as AI sourced", async () => {
    maasMocks.generateTextWithMaas.mockResolvedValue(
      JSON.stringify({
        answers: [
          {
            questionNo: "101",
            answerChoice: "B",
            explanationZh: "过去分词作被动语态。",
          },
        ],
      }),
    );

    const completed = await completeMissingAnswersWithMaas(draft);

    expect(completed.missingAnswerCount).toBe(0);
    expect(completed.items[0]).toMatchObject({
      answerChoice: "B",
      answerSource: "ai",
      explanationZh: "过去分词作被动语态。",
    });
  });
});

