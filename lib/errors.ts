export type AppErrorCode =
  | "AUTH_FAILED"
  | "AUTH_SETUP_FAILED"
  | "CLEAR_DATA_FAILED"
  | "DATABASE_READ_FAILED"
  | "REQUEST_INVALID"
  | "UNAUTHORIZED"
  | "GENERATION_LIMIT_EXCEEDED"
  | "MAAS_CONFIG_MISSING"
  | "OPENAI_IMAGE_CONFIG_MISSING"
  | "AI_GENERATION_FAILED"
  | "AI_RESPONSE_INVALID"
  | "OPENAI_IMAGE_GENERATION_FAILED"
  | "OPENAI_IMAGE_RESPONSE_INVALID"
  | "QUESTION_VALIDATION_FAILED"
  | "QUESTION_SUBTYPE_MISMATCH"
  | "SETTINGS_READ_FAILED"
  | "SETTINGS_UPDATE_FAILED"
  | "DATABASE_WRITE_FAILED";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
