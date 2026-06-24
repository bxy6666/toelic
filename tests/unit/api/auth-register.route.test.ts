import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

const authMocks = vi.hoisted(() => ({
  registerUser: vi.fn(),
  setAuthCookie: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  registerUser: authMocks.registerUser,
  setAuthCookie: authMocks.setAuthCookie,
}));

async function post(body: unknown) {
  const { POST } = await import("@/app/api/auth/register/route");

  return POST(
    new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
}

async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

beforeEach(() => {
  authMocks.registerUser.mockResolvedValue({
    user: { id: "user-2", username: "student" },
    setupCreated: false,
    token: "session-token",
    expiresAt: new Date("2030-01-01T00:00:00.000Z"),
  });
});

describe("POST /api/auth/register", () => {
  it("registers a new user and sets an auth cookie", async () => {
    const response = await post({
      username: "Student",
      password: "password123",
    });
    const payload = await readJson(response);

    expect(response.status).toBe(200);
    expect(authMocks.registerUser).toHaveBeenCalledWith(
      "Student",
      "password123",
    );
    expect(authMocks.setAuthCookie).toHaveBeenCalledWith(
      response,
      "session-token",
      new Date("2030-01-01T00:00:00.000Z"),
    );
    expect(payload).toMatchObject({
      ok: true,
      data: {
        user: { username: "student" },
        setupCreated: false,
      },
    });
  });

  it("returns a conflict when the username already exists", async () => {
    authMocks.registerUser.mockRejectedValue(
      new AppError("USER_ALREADY_EXISTS", "Already exists", 409),
    );

    const response = await post({
      username: "student",
      password: "password123",
    });
    const payload = await readJson(response);

    expect(response.status).toBe(409);
    expect(authMocks.setAuthCookie).not.toHaveBeenCalled();
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "USER_ALREADY_EXISTS" },
    });
  });

  it("returns a forbidden response when registration is disabled", async () => {
    authMocks.registerUser.mockRejectedValue(
      new AppError("REGISTRATION_DISABLED", "Disabled", 403),
    );

    const response = await post({
      username: "student",
      password: "password123",
    });
    const payload = await readJson(response);

    expect(response.status).toBe(403);
    expect(authMocks.setAuthCookie).not.toHaveBeenCalled();
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "REGISTRATION_DISABLED" },
    });
  });
});
