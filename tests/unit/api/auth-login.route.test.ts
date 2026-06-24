import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

const authMocks = vi.hoisted(() => ({
  loginOrSetup: vi.fn(),
  setAuthCookie: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  loginOrSetup: authMocks.loginOrSetup,
  setAuthCookie: authMocks.setAuthCookie,
}));

async function post(body: unknown) {
  const { POST } = await import("@/app/api/auth/login/route");

  return POST(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
}

async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

beforeEach(() => {
  authMocks.loginOrSetup.mockResolvedValue({
    user: { id: "user-1", username: "admin" },
    setupCreated: true,
    token: "session-token",
    expiresAt: new Date("2030-01-01T00:00:00.000Z"),
  });
});

describe("POST /api/auth/login", () => {
  it("logs in or creates the first admin and sets an auth cookie", async () => {
    const response = await post({ username: "Admin", password: "password123" });
    const payload = await readJson(response);

    expect(response.status).toBe(200);
    expect(authMocks.loginOrSetup).toHaveBeenCalledWith("Admin", "password123");
    expect(authMocks.setAuthCookie).toHaveBeenCalledWith(
      response,
      "session-token",
      new Date("2030-01-01T00:00:00.000Z"),
    );
    expect(payload).toMatchObject({
      ok: true,
      data: {
        user: { username: "admin" },
        setupCreated: true,
      },
    });
  });

  it("returns authentication errors without setting a cookie", async () => {
    authMocks.loginOrSetup.mockRejectedValue(
      new AppError("AUTH_FAILED", "Invalid", 401),
    );

    const response = await post({ username: "admin", password: "wrongpass" });
    const payload = await readJson(response);

    expect(response.status).toBe(401);
    expect(authMocks.setAuthCookie).not.toHaveBeenCalled();
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "AUTH_FAILED" },
    });
  });
});
