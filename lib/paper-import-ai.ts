import { AppError } from "@/lib/errors";
import { generateTextWithMaas } from "@/lib/maas-client";
import {
  importedOptionKeys,
  parseImportedDraftJson,
  validateImportedDraft,
  type ImportedOptionKey,
  type ImportedPaperDraft,
  type ImportedPaperItem,
  type ImportedPaperOption,
  type ImportedPaperSection,
} from "@/lib/paper-import-parser";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberOr(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asOptionKey(value: unknown) {
  const normalized = text(value).toUpperCase();
  return importedOptionKeys.includes(normalized as ImportedOptionKey)
    ? (normalized as ImportedOptionKey)
    : undefined;
}

function readOptions(value: unknown): ImportedPaperOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((option, index) => {
    const record = option as Record<string, unknown>;
    const optionKey = asOptionKey(record.optionKey);
    if (!optionKey) {
      throw new AppError("IMPORT_RESULT_INVALID", "AI returned an invalid option key.", 422);
    }

    return {
      optionKey,
      optionText: text(record.optionText),
      orderIndex: numberOr(record.orderIndex, index + 1),
    };
  });
}

function readSections(value: unknown): ImportedPaperSection[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [{ sectionCode: "imported", title: "Imported Questions", orderIndex: 1 }];
  }

  return value.map((section, index) => {
    const record = section as Record<string, unknown>;
    const sectionCode = text(record.sectionCode) || `section-${index + 1}`;

    return {
      sectionCode,
      title: text(record.title) || sectionCode,
      instructions: text(record.instructions) || undefined,
      orderIndex: numberOr(record.orderIndex, index + 1),
    };
  });
}

function readItems(value: unknown): ImportedPaperItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = item as Record<string, unknown>;
    const answerChoice = asOptionKey(record.answerChoice);

    return {
      questionNo: text(record.questionNo),
      stem: text(record.stem),
      options: readOptions(record.options),
      answerChoice,
      explanationZh: text(record.explanationZh) || undefined,
      answerSource: answerChoice ? "ai" : "missing",
      difficulty: text(record.difficulty) || undefined,
      sectionCode: text(record.sectionCode) || "imported",
      orderIndex: numberOr(record.orderIndex, index + 1),
      confidence: Math.min(1, Math.max(0, numberOr(record.confidence, 0.62))),
    };
  });
}

function normalizeAiDraft(
  parsed: unknown,
  fallback: Pick<ImportedPaperDraft, "title" | "sourceKey" | "versionLabel">,
) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new AppError("AI_RESPONSE_INVALID", "AI returned a non-object JSON value.", 502);
  }

  const record = parsed as Record<string, unknown>;
  const draft = {
    title: text(record.title) || fallback.title,
    description: text(record.description) || undefined,
    sourceKey: text(record.sourceKey) || fallback.sourceKey,
    versionLabel: text(record.versionLabel) || fallback.versionLabel,
    sections: readSections(record.sections),
    items: readItems(record.items),
    missingAnswerCount: 0,
    parserName: "maas-import-v1",
    confidence: 0,
  };

  return validateImportedDraft(draft);
}

export async function parseImportedPaperWithMaas(input: {
  text: string;
  title: string;
  sourceKey?: string;
  versionLabel: string;
}) {
  const raw = await generateTextWithMaas([
    {
      role: "system",
      content:
        "Extract online exam paper data from the user document. Return strict JSON only.",
    },
    {
      role: "user",
      content: [
        "Convert the document text into this JSON shape:",
        "{",
        '  "title": string,',
        '  "versionLabel": string,',
        '  "sections": [{"sectionCode": string, "title": string, "instructions": string, "orderIndex": number}],',
        '  "items": [{',
        '    "questionNo": string, "sectionCode": string, "stem": string,',
        '    "options": [{"optionKey": "A"|"B"|"C"|"D", "optionText": string, "orderIndex": number}],',
        '    "answerChoice": "A"|"B"|"C"|"D"|null,',
        '    "explanationZh": string, "difficulty": "easy"|"medium"|"hard",',
        '    "orderIndex": number, "confidence": number',
        "  }]",
        "}",
        "Only include single-choice questions with exactly A-D options.",
        "If no answer is present in the source, set answerChoice to null.",
        `Fallback title: ${input.title}`,
        `Fallback versionLabel: ${input.versionLabel}`,
        "Document text:",
        input.text.slice(0, 24_000),
      ].join("\n"),
    },
  ]);

  return normalizeAiDraft(parseImportedDraftJson(raw), input);
}

export async function completeMissingAnswersWithMaas(draft: ImportedPaperDraft) {
  const missing = draft.items.filter((item) => !item.answerChoice);
  if (missing.length === 0) {
    return draft;
  }

  const raw = await generateTextWithMaas([
    {
      role: "system",
      content:
        "You answer TOEIC-style single-choice questions. Return strict JSON only.",
    },
    {
      role: "user",
      content: [
        "For each question, choose the best answer from A-D and give a concise Chinese explanation.",
        'Return JSON: {"answers":[{"questionNo": string, "answerChoice": "A"|"B"|"C"|"D", "explanationZh": string}]}',
        JSON.stringify(
          missing.map((item) => ({
            questionNo: item.questionNo,
            stem: item.stem,
            options: item.options.map((option) => ({
              optionKey: option.optionKey,
              optionText: option.optionText,
            })),
          })),
        ),
      ].join("\n"),
    },
  ]);

  const parsed = parseImportedDraftJson(raw);
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { answers?: unknown }).answers)) {
    throw new AppError("AI_RESPONSE_INVALID", "AI answer completion returned invalid JSON.", 502);
  }

  const answers = new Map<string, { answerChoice: ImportedOptionKey; explanationZh: string }>();
  for (const answer of (parsed as { answers: unknown[] }).answers) {
    const record = answer as Record<string, unknown>;
    const answerChoice = asOptionKey(record.answerChoice);
    const questionNo = text(record.questionNo);
    if (!questionNo || !answerChoice) {
      throw new AppError("IMPORT_RESULT_INVALID", "AI returned an invalid answer.", 422);
    }
    answers.set(questionNo, {
      answerChoice,
      explanationZh: text(record.explanationZh),
    });
  }

  return validateImportedDraft({
    ...draft,
    items: draft.items.map((item) => {
      const completed = answers.get(item.questionNo);
      if (!completed || item.answerChoice) {
        return item;
      }

      return {
        ...item,
        answerChoice: completed.answerChoice,
        explanationZh: completed.explanationZh || item.explanationZh,
        answerSource: "ai",
        confidence: Math.max(item.confidence, 0.68),
      };
    }),
    parserName: `${draft.parserName}+maas-answer-v1`,
  });
}

