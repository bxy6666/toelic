import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import {
  createPostJsonAction,
  expectErrorResponse,
  expectOkResponse,
} from "../test-utils";

const authMocks = vi.hoisted(() => ({
  loginOrSetup: vi.fn(),
  setAuthCookie: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  loginOrSetup: authMocks.loginOrSetup,
  setAuthCookie: authMocks.setAuthCookie,
}));

const post = createPostJsonAction("http://localhost/api/auth/login", () =>
  import("@/app/api/auth/login/route"),
);

function setUp() {
  authMocks.loginOrSetup.mockResolvedValue({
    user: { id: "user-1", username: "admin" },
    setupCreated: true,
    token: "session-token",
    expiresAt: new Date("2030-01-01T00:00:00.000Z"),
  });
}

beforeEach(setUp);

describe("Acceptance: POST /api/auth/login", () => {
  it("Scenario: valid credentials start a session and set the cookie", async () => {
    const response = await post({ username: "Admin", password: "password123" });
    const payload = await expectOkResponse(response);

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

  it("Scenario: authentication errors return 401 without a cookie", async () => {
    authMocks.loginOrSetup.mockRejectedValue(
      new AppError("AUTH_FAILED", "Invalid", 401),
    );

    const response = await post({ username: "admin", password: "wrongpass" });

    await expectErrorResponse(response, 401, "AUTH_FAILED");
    expect(authMocks.setAuthCookie).not.toHaveBeenCalled();
  });
});
