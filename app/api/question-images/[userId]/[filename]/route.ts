import { readFile } from "fs/promises";
import path from "path";

import { AppError } from "@/lib/errors";
import { handleApiError } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { getGeneratedImagePath } from "@/lib/image-storage";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string; filename: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { userId, filename } = await params;

    if (userId !== user.id || filename.includes("/") || filename.includes("\\")) {
      throw new AppError("UNAUTHORIZED", "无权访问该图片。", 403);
    }

    const extension = path.extname(filename).toLowerCase();
    const contentType = contentTypes[extension];

    if (!contentType) {
      throw new AppError("REQUEST_INVALID", "不支持的图片格式。", 400);
    }

    const bytes = await readFile(getGeneratedImagePath(userId, filename));

    return new Response(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_READ_FAILED", "读取图片失败。", 404),
    );
  }
}
