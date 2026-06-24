import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createPostJsonAction,
  expectErrorResponse,
  expectOkResponse,
  setUpAuthenticatedUser,
  setUpUnauthenticatedUser,
} from "../test-utils";

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

const post = createPostJsonAction("http://localhost/api/settings/clear-data", () =>
  import("@/app/api/settings/clear-data/route"),
);

function setUp() {
  setUpAuthenticatedUser(authMocks.requireUserFromRequest);
  settingsMocks.clearStudyData.mockResolvedValue(undefined);
}

beforeEach(setUp);

describe("Acceptance: POST /api/settings/clear-data", () => {
  it("Scenario: confirmation text must be CLEAR before data is deleted", async () => {
    const response = await post({ confirmText: "clear" });

    await expectErrorResponse(response, 400, "REQUEST_INVALID");
    expect(settingsMocks.clearStudyData).not.toHaveBeenCalled();
  });

  it("Scenario: valid confirmation clears only the current user's data", async () => {
    const response = await post({ confirmText: "CLEAR" });
    const payload = await expectOkResponse(response);

    expect(settingsMocks.clearStudyData).toHaveBeenCalledWith("user-1");
    expect(payload).toMatchObject({ ok: true, data: { cleared: true } });
  });

  it("Scenario: unauthenticated requests stop before clearing data", async () => {
    setUpUnauthenticatedUser(authMocks.requireUserFromRequest);

    const response = await post({ confirmText: "CLEAR" });

    await expectErrorResponse(response, 401, "UNAUTHORIZED");
    expect(settingsMocks.clearStudyData).not.toHaveBeenCalled();
  });
});
