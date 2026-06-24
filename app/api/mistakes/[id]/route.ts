import { AppError } from "@/lib/errors";
import {
  handleApiError,
  jsonError,
  jsonOk,
  readJsonBody,
} from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { id } = await params;
    const body = (await readJsonBody(request)) as {
      action?: string;
      note?: string;
    };

    const mistake = await prisma.mistake.findFirst({
      where: { id, userId: user.id },
    });

    if (!mistake) {
      throw new AppError("REQUEST_INVALID", "错题不存在。", 404);
    }

    if (body.action === "mark-mastered") {
      const updated = await prisma.mistake.update({
        where: { id: mistake.id },
        data: { status: "mastered", masteredAt: new Date() },
      });
      return jsonOk(updated);
    }

    if (body.action === "remove") {
      const updated = await prisma.mistake.update({
        where: { id: mistake.id },
        data: { status: "removed" },
      });
      return jsonOk(updated);
    }

    if (body.action === "update-note") {
      const updated = await prisma.mistake.update({
        where: { id: mistake.id },
        data: { note: body.note?.slice(0, 500) || null },
      });
      return jsonOk(updated);
    }

    return jsonError(
      new AppError("REQUEST_INVALID", "不支持的错题操作。", 400),
    );
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "更新错题失败。", 500),
    );
  }
}
