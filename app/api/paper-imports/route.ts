import { AppError } from "@/lib/errors";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import { createPaperImport, listPaperImports } from "@/lib/paper-import-service";

export async function GET(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    return jsonOk(await listPaperImports(user.id));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DOCUMENT_PARSE_FAILED", "Import jobs read failed.", 500),
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    const formData = await request.formData();
    return jsonOk(await createPaperImport(user.id, formData));
  } catch (error) {
    return handleApiError(
      error,
      new AppError("DOCUMENT_PARSE_FAILED", "Document import failed.", 500),
    );
  }
}
