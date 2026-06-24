import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import {
  createPostJsonAction,
  expectErrorResponse,
  expectOkResponse,
} from "../test-utils";

const authMocks = vi.hoisted(() => ({
  registerUser: vi.fn(),
  setAuthCookie: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  registerUser: authMocks.registerUser,
  setAuthCookie: authMocks.setAuthCookie,
}));

const post = createPostJsonAction("http://localhost/api/auth/register", () =>
  import("@/app/api/auth/register/route"),
);

function setUp() {
  authMocks.registerUser.mockResolvedValue({
    user: { id: "user-2", username: "student" },
    setupCreated: false,
    token: "session-token",
    expiresAt: new Date("2030-01-01T00:00:00.000Z"),
  });
}

beforeEach(setUp);

describe("Acceptance: POST /api/auth/register", () => {
  it("Scenario: a new user is registered and receives an auth cookie", async () => {
    const response = await post({
      username: "Student",
      password: "password123",
    });
    const payload = await expectOkResponse(response);

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

  it("Scenario: duplicate usernames return a conflict without a cookie", async () => {
    authMocks.registerUser.mockRejectedValue(
      new AppError("USER_ALREADY_EXISTS", "Already exists", 409),
    );

    const response = await post({
      username: "student",
      password: "password123",
    });

    await expectErrorResponse(response, 409, "USER_ALREADY_EXISTS");
    expect(authMocks.setAuthCookie).not.toHaveBeenCalled();
  });

  it("Scenario: disabled registration returns forbidden without a cookie", async () => {
    authMocks.registerUser.mockRejectedValue(
      new AppError("REGISTRATION_DISABLED", "Disabled", 403),
    );

    const response = await post({
      username: "student",
      password: "password123",
    });

    await expectErrorResponse(response, 403, "REGISTRATION_DISABLED");
    expect(authMocks.setAuthCookie).not.toHaveBeenCalled();
  });
});
