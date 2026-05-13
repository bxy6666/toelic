import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    action?: string;
    note?: string;
  };

  if (body.action === "mark-mastered") {
    const mistake = await prisma.mistake.update({
      where: { id },
      data: { status: "mastered", masteredAt: new Date() },
    });
    return NextResponse.json({ ok: true, data: mistake });
  }

  if (body.action === "remove") {
    const mistake = await prisma.mistake.update({
      where: { id },
      data: { status: "removed" },
    });
    return NextResponse.json({ ok: true, data: mistake });
  }

  if (body.action === "update-note") {
    const mistake = await prisma.mistake.update({
      where: { id },
      data: { note: body.note?.slice(0, 500) || null },
    });
    return NextResponse.json({ ok: true, data: mistake });
  }

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "REQUEST_INVALID",
        message: "不支持的错题操作。",
      },
    },
    { status: 400 },
  );
}
