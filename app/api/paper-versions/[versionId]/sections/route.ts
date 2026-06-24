import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk, readJsonBody } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { createPaperSection } from "@/lib/paper-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { versionId } = await params;
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const section = await createPaperSection(user.id, versionId, {
      title: typeof body.title === "string" ? body.title : "",
      sectionCode:
        typeof body.sectionCode === "string" ? body.sectionCode : undefined,
      instructions:
        typeof body.instructions === "string" ? body.instructions : undefined,
      orderIndex:
        typeof body.orderIndex === "number" ? body.orderIndex : undefined,
    });

    return jsonOk(section);
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "创建分区失败。", 500),
    );
  }
}
