import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk, readJsonBody } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { createPaperVersion } from "@/lib/paper-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ paperId: string }> },
) {
  try {
    const user = await requireUserFromRequest(request);
    const { paperId } = await params;
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const version = await createPaperVersion(user.id, paperId, {
      versionLabel:
        typeof body.versionLabel === "string" ? body.versionLabel : "",
      defaultDurationSeconds:
        typeof body.defaultDurationSeconds === "number"
          ? body.defaultDurationSeconds
          : undefined,
    });

    return jsonOk(version);
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "创建试卷版本失败。", 500),
    );
  }
}
