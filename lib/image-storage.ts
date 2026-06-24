import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { AppError } from "@/lib/errors";
import type { ValidatedQuestion } from "@/lib/question-validation";

const IMAGE_ROOT = path.join(process.cwd(), "output", "generated-images");

function parseImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/(png|jpeg|webp);base64,([\s\S]+)$/);

  if (!match) {
    throw new AppError(
      "OPENAI_IMAGE_RESPONSE_INVALID",
      "图片生成结果格式不正确，无法保存到本地文件。",
      502,
    );
  }

  const extension = match[1] === "jpeg" ? "jpg" : match[1];

  return {
    extension,
    bytes: Buffer.from(match[2], "base64"),
  };
}

export function getGeneratedImagePath(userId: string, filename: string) {
  return path.join(IMAGE_ROOT, userId, filename);
}

export async function saveImageDataUrl(dataUrl: string, userId: string) {
  const parsed = parseImageDataUrl(dataUrl);
  const filename = `${Date.now()}-${randomUUID()}.${parsed.extension}`;
  const directory = path.join(IMAGE_ROOT, userId);

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), parsed.bytes);

  return `/api/question-images/${userId}/${filename}`;
}

export async function persistQuestionImages(
  questions: ValidatedQuestion[],
  userId: string,
) {
  return Promise.all(
    questions.map(async (question) => {
      if (!question.imageUrl?.startsWith("data:image/")) {
        return question;
      }

      return {
        ...question,
        imageUrl: await saveImageDataUrl(question.imageUrl, userId),
      };
    }),
  );
}
