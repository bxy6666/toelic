import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

const authMocks = vi.hoisted(() => ({
  requireUserFromRequest: vi.fn(),
}));

const settingsMocks = vi.hoisted(() => ({
  clearStudyData: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireUserFromRequest: authMocks.requireUserFromRequest,
}));

vi.mock("@/lib/settings-service", () => ({
  clearStudyData: settingsMocks.clearStudyData,
}));

async function post(body: unknown) {
  const { POST } = await import("@/app/api/settings/clear-data/route");

  return POST(
    new Request("http://localhost/api/settings/clear-data", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
}

async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

beforeEach(() => {
  authMocks.requireUserFromRequest.mockResolvedValue({
    id: "user-1",
    username: "admin",
  });
  settingsMocks.clearStudyData.mockResolvedValue(undefined);
});

describe("POST /api/settings/clear-data", () => {
  it("requires the server-side CLEAR confirmation", async () => {
    const response = await post({ confirmText: "clear" });
    const payload = await readJson(response);

    expect(response.status).toBe(400);
    expect(settingsMocks.clearStudyData).not.toHaveBeenCalled();
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "REQUEST_INVALID" },
    });
  });

  it("clears only the current user's study data", async () => {
    const response = await post({ confirmText: "CLEAR" });
    const payload = await readJson(response);

    expect(response.status).toBe(200);
    expect(settingsMocks.clearStudyData).toHaveBeenCalledWith("user-1");
    expect(payload).toMatchObject({ ok: true, data: { cleared: true } });
  });

  it("rejects unauthenticated requests", async () => {
    authMocks.requireUserFromRequest.mockRejectedValue(
      new AppError("UNAUTHORIZED", "Login required", 401),
    );

    const response = await post({ confirmText: "CLEAR" });
    const payload = await readJson(response);

    expect(response.status).toBe(401);
    expect(settingsMocks.clearStudyData).not.toHaveBeenCalled();
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "UNAUTHORIZED" },
    });
  });
});
