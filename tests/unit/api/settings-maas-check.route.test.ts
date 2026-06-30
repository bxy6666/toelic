import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import {
  expectErrorResponse,
  expectOkResponse,
  setUpAuthenticatedUser,
  setUpUnauthenticatedUser,
} from "../test-utils";

const authMocks = vi.hoisted(() => ({
  requireUserFromRequest: vi.fn(),
}));

const settingsMocks = vi.hoisted(() => ({
  checkMaasConnection: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireUserFromRequest: authMocks.requireUserFromRequest,
}));

vi.mock("@/lib/settings-service", () => ({
  checkMaasConnection: settingsMocks.checkMaasConnection,
}));

function request() {
  return new Request("http://localhost/api/settings/maas-check", {
    method: "POST",
  });
}

function setUp() {
  vi.clearAllMocks();
  setUpAuthenticatedUser(authMocks.requireUserFromRequest);
  settingsMocks.checkMaasConnection.mockResolvedValue({
    status: "ok",
    message: "MaaS connection is healthy.",
    latencyMs: 120,
    checkedAt: "2030-01-01T00:00:00.000Z",
    hasApiKey: true,
    maasBaseUrl: "https://api.example.test/v1/",
    maasModel: "deepseek-v3.2",
  });
}

beforeEach(setUp);

describe("Acceptance: /api/settings/maas-check", () => {
  it("Scenario: authenticated users can check MaaS connectivity", async () => {
    const { POST } = await import("@/app/api/settings/maas-check/route");

    const response = await POST(request());
    const payload = await expectOkResponse(response);

    expect(settingsMocks.checkMaasConnection).toHaveBeenCalled();
    expect(payload).toMatchObject({
      data: { status: "ok", latencyMs: 120 },
    });
  });

  it("Scenario: unauthenticated users get the existing JSON error style", async () => {
    setUpUnauthenticatedUser(authMocks.requireUserFromRequest);
    const { POST } = await import("@/app/api/settings/maas-check/route");

    const response = await POST(request());

    await expectErrorResponse(response, 401, "UNAUTHORIZED");
    expect(settingsMocks.checkMaasConnection).not.toHaveBeenCalled();
  });

  it("Scenario: MaaS failures preserve their actionable error code", async () => {
    settingsMocks.checkMaasConnection.mockRejectedValue(
      new AppError("AI_GENERATION_FAILED", "MaaS authorization failed.", 502),
    );
    const { POST } = await import("@/app/api/settings/maas-check/route");

    const response = await POST(request());

    await expectErrorResponse(response, 502, "AI_GENERATION_FAILED");
  });
});

