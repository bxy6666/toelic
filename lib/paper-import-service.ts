import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Prisma } from "@prisma/client";
import * as mammoth from "mammoth";

import { AppError } from "@/lib/errors";
import {
  completeMissingAnswersWithMaas,
  parseImportedPaperWithMaas,
} from "@/lib/paper-import-ai";
import {
  importedOptionKeys,
  parseImportedPaperText,
  validateImportedDraft,
  type ImportedPaperDraft,
} from "@/lib/paper-import-parser";
import { prisma } from "@/lib/prisma";

const maxUploadBytes = 10 * 1024 * 1024;
const uploadRoot = path.join(process.cwd(), "output", "uploads", "papers");

type ImportJobWithFile = Prisma.ImportJobGetPayload<{
  include: { uploadedFile: true };
}>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readDraft(value: string | null | undefined) {
  const draft = parseJson<ImportedPaperDraft | null>(value, null);
  if (!draft) {
    throw new AppError("IMPORT_RESULT_INVALID", "Import result is missing.", 422);
  }

  return validateImportedDraft(draft);
}

function toResultJson(draft: ImportedPaperDraft) {
  return JSON.stringify(validateImportedDraft(draft));
}

function readError(error: unknown) {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  return {
    code: "DOCUMENT_PARSE_FAILED",
    message: "Document import failed.",
  };
}

function requireSupportedFile(file: File) {
  const originalName = file.name || "upload";
  const extension = path.extname(originalName).toLowerCase();
  const mime = file.type || "application/octet-stream";

  if (![".pdf", ".docx"].includes(extension)) {
    throw new AppError(
      "UNSUPPORTED_DOCUMENT_TYPE",
      "Only text PDF and DOCX files are supported.",
      400,
    );
  }

  if (file.size <= 0 || file.size > maxUploadBytes) {
    throw new AppError(
      "FILE_UPLOAD_INVALID",
      "Upload file size must be between 1 byte and 10 MB.",
      400,
    );
  }

  return { originalName, extension, mime };
}

async function extractPdfText(filePath: string) {
  const { PDFParse } = await import("pdf-parse");
  const data = await readFile(filePath);
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractDocumentText(filePath: string, extension: string) {
  if (extension === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (extension === ".pdf") {
    const textValue = await extractPdfText(filePath);
    if (textValue.trim().length < 20) {
      throw new AppError(
        "UNSUPPORTED_SCANNED_DOCUMENT",
        "This PDF does not contain enough text. Scanned PDFs need OCR in a later phase.",
        422,
      );
    }
    return textValue;
  }

  throw new AppError("UNSUPPORTED_DOCUMENT_TYPE", "Unsupported document type.", 400);
}

function serializeJob(job: ImportJobWithFile) {
  return {
    id: job.id,
    status: job.status,
    progress: job.progress,
    mode: job.mode,
    error: parseJson(job.errorJson, null),
    result: parseJson(job.resultJson, null),
    paperId: job.paperId,
    paperVersionId: job.paperVersionId,
    completedAt: job.completedAt?.toISOString() ?? null,
    appliedAt: job.appliedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    uploadedFile: job.uploadedFile
      ? {
          id: job.uploadedFile.id,
          originalName: job.uploadedFile.originalName,
          extension: job.uploadedFile.extension,
          mime: job.uploadedFile.mime,
          sizeBytes: job.uploadedFile.sizeBytes,
          status: job.uploadedFile.status,
        }
      : null,
  };
}

async function getOwnedImportJob(userId: string, jobId: string) {
  const job = await prisma.importJob.findFirst({
    where: { id: jobId, userId },
    include: { uploadedFile: true },
  });

  if (!job) {
    throw new AppError("REQUEST_INVALID", "Import job does not exist.", 404);
  }

  return job;
}

async function parseWithFallback(input: {
  text: string;
  title: string;
  sourceKey: string;
  versionLabel: string;
}) {
  try {
    return parseImportedPaperText(input);
  } catch (error) {
    if (
      error instanceof AppError &&
      error.code === "UNSUPPORTED_SCANNED_DOCUMENT"
    ) {
      throw error;
    }

    return parseImportedPaperWithMaas(input);
  }
}

export async function createPaperImport(userId: string, formData: FormData) {
  const fileValue = formData.get("file");
  if (!(fileValue instanceof File)) {
    throw new AppError("FILE_UPLOAD_INVALID", "A PDF or DOCX file is required.", 400);
  }

  const { originalName, extension, mime } = requireSupportedFile(fileValue);
  const requestedTitle = text(formData.get("title"));
  const requestedSourceKey = text(formData.get("sourceKey"));
  const requestedVersionLabel = text(formData.get("versionLabel"));
  const bytes = Buffer.from(await fileValue.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const sourceKey = requestedSourceKey || `import-${sha256.slice(0, 12)}`;
  const title = requestedTitle || originalName.replace(/\.[^.]+$/, "");
  const versionLabel =
    requestedVersionLabel ||
    `import-${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "")}`;

  const userDir = path.join(uploadRoot, sanitizeSegment(userId));
  await mkdir(userDir, { recursive: true });
  const fileName = `${Date.now()}-${sha256.slice(0, 12)}-${sanitizeSegment(originalName)}`;
  const filePath = path.join(userDir, fileName);
  await writeFile(filePath, bytes);

  const uploadedFile = await prisma.uploadedFile.create({
    data: {
      userId,
      source: "paper-import",
      originalName,
      extension,
      filePath,
      mime,
      sizeBytes: bytes.length,
      sha256,
      status: "uploaded",
    },
  });

  const importJob = await prisma.importJob.create({
    data: {
      userId,
      uploadedFileId: uploadedFile.id,
      mode: "draft",
      optionsJson: JSON.stringify({ title, sourceKey, versionLabel }),
      status: "processing",
      progress: 10,
    },
  });

  const parseJob = await prisma.parseJob.create({
    data: {
      userId,
      uploadedFileId: uploadedFile.id,
      parserName: "pending",
      status: "processing",
      progress: 10,
    },
  });

  try {
    const sourceText = await extractDocumentText(filePath, extension);
    const sourceTextPath = `${filePath}.txt`;
    await writeFile(sourceTextPath, sourceText, "utf8");

    const draft = await parseWithFallback({
      text: sourceText,
      title,
      sourceKey,
      versionLabel,
    });
    const resultJson = toResultJson(draft);

    await prisma.$transaction([
      prisma.parseJob.update({
        where: { id: parseJob.id },
        data: {
          parserName: draft.parserName,
          sourceTextPath,
          resultJson,
          confidence: draft.confidence,
          status: "ready",
          progress: 100,
          completedAt: new Date(),
        },
      }),
      prisma.importJob.update({
        where: { id: importJob.id },
        data: {
          resultJson,
          status: "ready",
          progress: 100,
          completedAt: new Date(),
        },
      }),
      prisma.uploadedFile.update({
        where: { id: uploadedFile.id },
        data: { status: "parsed" },
      }),
    ]);
  } catch (error) {
    const errorJson = JSON.stringify(readError(error));
    await prisma.$transaction([
      prisma.parseJob.update({
        where: { id: parseJob.id },
        data: {
          status: "failed",
          errorJson,
          progress: 100,
          completedAt: new Date(),
        },
      }),
      prisma.importJob.update({
        where: { id: importJob.id },
        data: {
          status: "failed",
          errorJson,
          progress: 100,
          completedAt: new Date(),
        },
      }),
      prisma.uploadedFile.update({
        where: { id: uploadedFile.id },
        data: { status: "failed" },
      }),
    ]);
  }

  return getPaperImport(userId, importJob.id);
}

export async function getPaperImport(userId: string, jobId: string) {
  const job = await getOwnedImportJob(userId, jobId);
  return serializeJob(job);
}

export async function listPaperImports(userId: string) {
  const jobs = await prisma.importJob.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 12,
    include: { uploadedFile: true },
  });

  return jobs.map(serializeJob);
}

export async function completeImportAnswers(userId: string, jobId: string) {
  const job = await getOwnedImportJob(userId, jobId);

  if (job.status !== "ready") {
    throw new AppError("IMPORT_JOB_NOT_READY", "Import job is not ready.", 409);
  }

  const draft = readDraft(job.resultJson);
  const completed = await completeMissingAnswersWithMaas(draft);
  const resultJson = toResultJson(completed);

  await prisma.$transaction([
    prisma.importJob.update({
      where: { id: job.id },
      data: { resultJson, completedAt: new Date() },
    }),
    prisma.parseJob.updateMany({
      where: { userId, uploadedFileId: job.uploadedFileId },
      data: {
        resultJson,
        parserName: completed.parserName,
        confidence: completed.confidence,
      },
    }),
  ]);

  return getPaperImport(userId, job.id);
}

export async function applyPaperImport(userId: string, jobId: string) {
  const job = await getOwnedImportJob(userId, jobId);

  if (job.status !== "ready") {
    throw new AppError("IMPORT_JOB_NOT_READY", "Import job is not ready.", 409);
  }

  const draft = readDraft(job.resultJson);
  if (draft.missingAnswerCount > 0) {
    throw new AppError(
      "IMPORT_RESULT_INVALID",
      "All imported questions must have answers before creating a draft version.",
      422,
    );
  }

  const created = await prisma.$transaction(async (tx) => {
    const existingPaper = draft.sourceKey
      ? await tx.paper.findFirst({
          where: { userId, sourceKey: draft.sourceKey },
        })
      : null;

    const paper =
      existingPaper ??
      (await tx.paper.create({
        data: {
          userId,
          title: draft.title,
          description: draft.description || "Imported from uploaded document.",
          sourceKey: draft.sourceKey,
        },
      }));

    const duplicateVersion = await tx.paperVersion.findFirst({
      where: { paperId: paper.id, versionLabel: draft.versionLabel },
    });

    if (duplicateVersion) {
      throw new AppError(
        "REQUEST_INVALID",
        "A version with this label already exists for the imported paper.",
        409,
      );
    }

    const version = await tx.paperVersion.create({
      data: {
        paperId: paper.id,
        versionLabel: draft.versionLabel,
        status: "draft",
        defaultDurationSeconds: 7200,
      },
    });

    const sectionIds = new Map<string, string>();
    for (const section of draft.sections.sort((a, b) => a.orderIndex - b.orderIndex)) {
      const createdSection = await tx.paperSection.create({
        data: {
          paperVersionId: version.id,
          sectionCode: section.sectionCode,
          title: section.title,
          instructions: section.instructions,
          orderIndex: section.orderIndex,
        },
      });
      sectionIds.set(section.sectionCode, createdSection.id);
    }

    for (const item of draft.items.sort((a, b) => a.orderIndex - b.orderIndex)) {
      if (!item.answerChoice || !importedOptionKeys.includes(item.answerChoice)) {
        throw new AppError(
          "IMPORT_RESULT_INVALID",
          `Question ${item.questionNo} is missing a valid answer.`,
          422,
        );
      }

      const createdItem = await tx.questionItem.create({
        data: {
          paperVersionId: version.id,
          sectionId: sectionIds.get(item.sectionCode || "") ?? null,
          questionNo: item.questionNo,
          itemType: "single_choice",
          stem: item.stem,
          answerKeyJson: JSON.stringify({
            choice: item.answerChoice,
            source: item.answerSource,
          }),
          explanationJson: JSON.stringify({
            zh: item.explanationZh || "",
            answerSource: item.answerSource,
            importConfidence: item.confidence,
          }),
          difficulty: item.difficulty,
          orderIndex: item.orderIndex,
        },
      });

      for (const option of item.options.sort((a, b) => a.orderIndex - b.orderIndex)) {
        await tx.questionOption.create({
          data: {
            itemId: createdItem.id,
            optionKey: option.optionKey,
            optionText: option.optionText,
            orderIndex: option.orderIndex,
          },
        });
      }
    }

    await tx.importJob.update({
      where: { id: job.id },
      data: {
        paperId: paper.id,
        paperVersionId: version.id,
        status: "applied",
        appliedAt: new Date(),
      },
    });

    if (job.uploadedFileId) {
      await tx.uploadedFile.update({
        where: { id: job.uploadedFileId },
        data: {
          paperId: paper.id,
          status: "applied",
        },
      });

      await tx.parseJob.updateMany({
        where: { userId, uploadedFileId: job.uploadedFileId },
        data: {
          paperId: paper.id,
          paperVersionId: version.id,
        },
      });
    }

    return { paper, version };
  });

  return {
    paperId: created.paper.id,
    paperVersionId: created.version.id,
    editUrl: `/paper-versions/${created.version.id}/edit`,
  };
}
