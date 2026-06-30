import { describe, expect, it } from "vitest";

import { parseImportedPaperText } from "@/lib/paper-import-parser";

const sampleText = `
Part 5 Incomplete Sentences
101. The report must be submitted before the end of the week.
A. submit
B. submitted
C. submitting
D. submission
102. The manager asked that the files be kept confidential.
A. kept
B. keep
C. keeping
D. keeps
103. The new printer is more reliable than the old one.
A. reliable
B. reliably
C. reliability
D. relied

Answer Key
101. B
102. A
`;

describe("paper import parser", () => {
  it("parses single-choice questions and keeps missing answers explicit", () => {
    const draft = parseImportedPaperText({
      text: sampleText,
      title: "Sample Import",
      sourceKey: "sample-import",
      versionLabel: "v1",
    });

    expect(draft.items).toHaveLength(3);
    expect(draft.items[0]).toMatchObject({
      questionNo: "101",
      answerChoice: "B",
      answerSource: "document",
    });
    expect(draft.items[1].options.map((option) => option.optionKey)).toEqual([
      "A",
      "B",
      "C",
      "D",
    ]);
    expect(draft.items[2]).toMatchObject({
      questionNo: "103",
      answerChoice: undefined,
      answerSource: "missing",
    });
    expect(draft.missingAnswerCount).toBe(1);
  });

  it("parses compact answer-key rows without punctuation", () => {
    const draft = parseImportedPaperText({
      text: `
Part 5 Incomplete Sentences
101. The report must be submitted before the end of the week.
A. submit
B. submitted
C. submitting
D. submission

Answer Key
101 B
`,
      title: "Compact Answers",
      versionLabel: "v1",
    });

    expect(draft.items[0]).toMatchObject({
      questionNo: "101",
      answerChoice: "B",
      answerSource: "document",
    });
  });

  it("rejects documents without recognizable questions", () => {
    expect(() =>
      parseImportedPaperText({
        text: "This is not a test paper.",
        title: "Bad",
        versionLabel: "v1",
      }),
    ).toThrow(/No single-choice questions/);
  });
});

