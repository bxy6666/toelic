import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { listMistakes } from "@/lib/mistake-service";

export async function GET(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const grammarPoint = searchParams.get("grammarPoint") || undefined;

    const data = await listMistakes(user.id, { type, status, tag, grammarPoint });

    return jsonOk(data);
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DATABASE_READ_FAILED", "读取错题列表失败。", 500),
    );
  }
}
