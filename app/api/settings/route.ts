import { NextResponse } from "next/server";

import {
  getSettings,
  updateSettings,
  validateSettingsUpdate,
  type SettingsUpdateInput,
} from "@/lib/settings-service";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ ok: true, data: settings });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "SETTINGS_READ_FAILED",
          message: "读取设置失败，请稍后重试。",
        },
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  let body: SettingsUpdateInput;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "REQUEST_INVALID",
          message: "请求格式不是有效 JSON。",
        },
      },
      { status: 400 },
    );
  }

  const errors = validateSettingsUpdate(body);

  if (errors.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "REQUEST_INVALID",
          message: errors.join(" "),
        },
      },
      { status: 400 },
    );
  }

  try {
    await updateSettings(body);
    const settings = await getSettings();
    return NextResponse.json({ ok: true, data: settings });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "SETTINGS_UPDATE_FAILED",
          message: "保存设置失败，请稍后重试。",
        },
      },
      { status: 500 },
    );
  }
}
