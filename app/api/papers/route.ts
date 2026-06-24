import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk, readJsonBody } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { createPaper, listPapers } from "@/lib/paper-service";

export async function GET(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    return jsonOk(await listPapers(user.id));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_READ_FAILED", "读取试卷列表失败。", 500),
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const paper = await createPaper(user.id, {
      title: typeof body.title === "string" ? body.title : "",
      description:
        typeof body.description === "string" ? body.description : undefined,
      sourceKey: typeof body.sourceKey === "string" ? body.sourceKey : undefined,
    });

    return jsonOk(paper);
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_WRITE_FAILED", "创建试卷失败。", 500),
    );
  }
}
