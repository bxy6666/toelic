import { NextResponse } from "next/server";

import { clearStudyData } from "@/lib/settings-service";

export async function POST() {
  try {
    await clearStudyData();
    return NextResponse.json({ ok: true, data: { cleared: true } });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CLEAR_DATA_FAILED",
          message: "清除本地学习数据失败，请稍后重试。",
        },
      },
      { status: 500 },
    );
  }
}
