import { AppError } from "@/lib/errors";

export const importedOptionKeys = ["A", "B", "C", "D"] as const;

export type ImportedOptionKey = (typeof importedOptionKeys)[number];

export type ImportedPaperOption = {
  optionKey: ImportedOptionKey;
  optionText: string;
  orderIndex: number;
};

export type ImportedPaperSection = {
  sectionCode: string;
  title: string;
  instructions?: string;
  orderIndex: number;
};

export type ImportedPaperItem = {
  questionNo: string;
  stem: string;
  options: ImportedPaperOption[];
  answerChoice?: ImportedOptionKey;
  explanationZh?: string;
  answerSource: "document" | "ai" | "missing";
  difficulty?: string;
  sectionCode?: string;
  orderIndex: number;
  confidence: number;
};

export type ImportedPaperDraft = {
  title: string;
  description?: string;
  sourceKey?: string;
  versionLabel: string;
  sections: ImportedPaperSection[];
  items: ImportedPaperItem[];
  missingAnswerCount: number;
  parserName: string;
  confidence: number;
};

type MutableItem = Omit<ImportedPaperItem, "options"> & {
  options: Partial<Record<ImportedOptionKey, ImportedPaperOption>>;
};

const questionPattern = /^(\d{1,4})[\).、]\s+(.+)$/;
const optionPattern = /^([A-D])[\).、:]\s+(.+)$/i;
const sectionPattern =
  /^(part|section)\s+([A-Z0-9]+)\b[:：.\-\s]*(.*)$|^(第[一二三四五六七八九十0-9]+[部分节][：:\s]*(.*))$/i;
const answerAreaPattern = /^(answer\s*key|answers?|答案|参考答案)\b/i;
const answerEntryPattern =
  /(?:^|[\s,;，；])(?:Q(?:uestion)?\s*)?(\d{1,4})\s*(?:[\).:：\-、．。]|\s)\s*([A-D])(?=$|[\s,;，；])/gi;

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function asOptionKey(value: string): ImportedOptionKey | null {
  const normalized = value.trim().toUpperCase();
  return importedOptionKeys.includes(normalized as ImportedOptionKey)
    ? (normalized as ImportedOptionKey)
    : null;
}

function readAnswerMap(lines: string[]) {
  const answers = new Map<string, ImportedOptionKey>();
  let inAnswerArea = false;

  for (const line of lines) {
    if (answerAreaPattern.test(line)) {
      inAnswerArea = true;
    }

    if (!inAnswerArea && !answerEntryPattern.test(line)) {
      continue;
    }

    answerEntryPattern.lastIndex = 0;
    const matches = line.matchAll(answerEntryPattern);

    for (const match of matches) {
      const key = asOptionKey(match[2]);
      if (key) {
        answers.set(match[1], key);
      }
    }
  }

  return answers;
}

function isSectionLine(line: string) {
  return sectionPattern.test(line);
}

function readSection(line: string, orderIndex: number): ImportedPaperSection {
  const match = line.match(sectionPattern);
  const code = match?.[2] || `section-${orderIndex}`;
  const title = match?.[3] || match?.[4] || line;

  return {
    sectionCode: code.toString().trim().toLowerCase().replace(/\s+/g, "-"),
    title: title.trim() || line,
    orderIndex,
  };
}

function finalizeItem(
  item: MutableItem | null,
  answers: Map<string, ImportedOptionKey>,
) {
  if (!item) {
    return null;
  }

  const options = importedOptionKeys.map((optionKey, index) => {
    const option = item.options[optionKey];
    return {
      optionKey,
      optionText: option?.optionText.trim() || "",
      orderIndex: option?.orderIndex ?? index + 1,
    };
  });

  const documentAnswer = answers.get(item.questionNo);
  const answerChoice = item.answerChoice ?? documentAnswer;

  return {
    ...item,
    stem: item.stem.trim(),
    options,
    answerChoice,
    answerSource: answerChoice ? "document" : "missing",
  } satisfies ImportedPaperItem;
}

export function validateImportedDraft(draft: ImportedPaperDraft) {
  if (!draft.items.length) {
    throw new AppError(
      "DOCUMENT_PARSE_FAILED",
      "No single-choice questions were found in the document.",
      422,
    );
  }

  const questionNos = new Set<string>();

  for (const item of draft.items) {
    if (!item.questionNo.trim() || questionNos.has(item.questionNo)) {
      throw new AppError(
        "IMPORT_RESULT_INVALID",
        "Imported questions must have unique question numbers.",
        422,
      );
    }
    questionNos.add(item.questionNo);

    if (!item.stem.trim()) {
      throw new AppError("IMPORT_RESULT_INVALID", "Imported question stem is empty.", 422);
    }

    const optionKeys = new Set(item.options.map((option) => option.optionKey));
    if (!importedOptionKeys.every((key) => optionKeys.has(key))) {
      throw new AppError(
        "IMPORT_RESULT_INVALID",
        `Question ${item.questionNo} must include A-D options.`,
        422,
      );
    }

    if (item.options.some((option) => !option.optionText.trim())) {
      throw new AppError(
        "IMPORT_RESULT_INVALID",
        `Question ${item.questionNo} has an empty option.`,
        422,
      );
    }

    if (item.answerChoice && !optionKeys.has(item.answerChoice)) {
      throw new AppError(
        "IMPORT_RESULT_INVALID",
        `Question ${item.questionNo} answer must match an option.`,
        422,
      );
    }
  }

  return {
    ...draft,
    missingAnswerCount: draft.items.filter((item) => !item.answerChoice).length,
    confidence:
      draft.items.reduce((sum, item) => sum + item.confidence, 0) /
      Math.max(draft.items.length, 1),
  };
}

export function parseImportedPaperText(input: {
  text: string;
  title: string;
  sourceKey?: string;
  versionLabel: string;
}) {
  const normalized = normalizeText(input.text);
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const answers = readAnswerMap(lines);
  const sections: ImportedPaperSection[] = [];
  const items: ImportedPaperItem[] = [];
  let currentSection: ImportedPaperSection | null = null;
  let currentItem: MutableItem | null = null;
  let currentOptionKey: ImportedOptionKey | null = null;

  for (const line of lines) {
    if (answerAreaPattern.test(line)) {
      break;
    }

    if (isSectionLine(line)) {
      const section = readSection(line, sections.length + 1);
      sections.push(section);
      currentSection = section;
      continue;
    }

    const questionMatch = line.match(questionPattern);
    if (questionMatch) {
      const previous = finalizeItem(currentItem, answers);
      if (previous) {
        items.push(previous);
      }

      currentItem = {
        questionNo: questionMatch[1],
        stem: questionMatch[2],
        options: {},
        sectionCode: currentSection?.sectionCode,
        answerSource: "missing",
        orderIndex: items.length + 1,
        confidence: 0.72,
      };
      currentOptionKey = null;
      continue;
    }

    const optionMatch = line.match(optionPattern);
    const optionKey = optionMatch ? asOptionKey(optionMatch[1]) : null;
    if (currentItem && optionKey && optionMatch) {
      currentItem.options[optionKey] = {
        optionKey,
        optionText: optionMatch[2],
        orderIndex: importedOptionKeys.indexOf(optionKey) + 1,
      };
      currentOptionKey = optionKey;
      continue;
    }

    if (currentItem && currentOptionKey) {
      const currentOption = currentItem.options[currentOptionKey];
      if (currentOption) {
        currentOption.optionText = `${currentOption.optionText} ${line}`.trim();
      }
      continue;
    }

    if (currentItem) {
      currentItem.stem = `${currentItem.stem} ${line}`.trim();
    }
  }

  const last = finalizeItem(currentItem, answers);
  if (last) {
    items.push(last);
  }

  const fallbackSection =
    sections.length > 0
      ? []
      : [
          {
            sectionCode: "imported",
            title: "Imported Questions",
            orderIndex: 1,
          },
        ];

  return validateImportedDraft({
    title: input.title,
    sourceKey: input.sourceKey,
    versionLabel: input.versionLabel,
    sections: sections.length > 0 ? sections : fallbackSection,
    items: items.map((item) => ({
      ...item,
      sectionCode: item.sectionCode ?? "imported",
      confidence: item.answerChoice ? item.confidence : item.confidence - 0.1,
    })),
    missingAnswerCount: 0,
    parserName: "rule-text-v1",
    confidence: 0,
  });
}

export function parseImportedDraftJson(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonText = fenced ? fenced[1].trim() : trimmed;

  if (!fenced && trimmed.includes("```")) {
    throw new AppError("AI_RESPONSE_INVALID", "AI returned mixed Markdown.", 502);
  }

  try {
    return JSON.parse(jsonText) as unknown;
  } catch {
    throw new AppError("AI_RESPONSE_INVALID", "AI returned invalid JSON.", 502);
  }
}

