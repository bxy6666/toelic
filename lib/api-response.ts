import { NextResponse } from "next/server";

import { AppError, isAppError } from "@/lib/errors";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(error: AppError) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
    },
    { status: error.status },
  );
}

export function handleApiError(error: unknown, fallback: AppError) {
  return jsonError(isAppError(error) ? error : fallback);
}

export async function readJsonBody(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    throw new AppError("REQUEST_INVALID", "请求格式不是有效 JSON。", 400);
  }
}
