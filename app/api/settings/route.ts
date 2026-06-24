import { AppError } from "@/lib/errors";
import {
  handleApiError,
  jsonError,
  jsonOk,
  readJsonBody,
} from "@/lib/api-response";
import { requireUserFromRequest } from "@/lib/auth";
import {
  getSettings,
  updateSettings,
  validateSettingsUpdate,
  type SettingsUpdateInput,
} from "@/lib/settings-service";

export async function GET(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    const settings = await getSettings(user.id);
    return jsonOk(settings);
  } catch (error) {
    return handleApiError(
      error,
      new AppError("SETTINGS_READ_FAILED", "读取设置失败，请稍后重试。", 500),
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    const body = (await readJsonBody(request)) as SettingsUpdateInput;

    const errors = validateSettingsUpdate(body);

    if (errors.length > 0) {
      return jsonError(
        new AppError("REQUEST_INVALID", errors.join(" "), 400),
      );
    }

    await updateSettings(user.id, body);
    const settings = await getSettings(user.id);
    return jsonOk(settings);
  } catch (error) {
    return handleApiError(
      error,
      new AppError("SETTINGS_UPDATE_FAILED", "保存设置失败，请稍后重试。", 500),
    );
  }
}
