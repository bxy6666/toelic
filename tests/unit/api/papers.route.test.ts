import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
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

const paperMocks = vi.hoisted(() => ({
  createPaper: vi.fn(),
  listPapers: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireUserFromRequest: authMocks.requireUserFromRequest,
}));

vi.mock("@/lib/paper-service", () => ({
  createPaper: paperMocks.createPaper,
  listPapers: paperMocks.listPapers,
}));

const post = createPostJsonAction("http://localhost/api/papers", () =>
  import("@/app/api/papers/route"),
);

function setUp() {
  vi.clearAllMocks();
  setUpAuthenticatedUser(authMocks.requireUserFromRequest);
  paperMocks.createPaper.mockResolvedValue({
    id: "paper-1",
    title: "Sample",
  });
  paperMocks.listPapers.mockResolvedValue([]);
}

beforeEach(setUp);

describe("Acceptance: /api/papers", () => {
  it("Scenario: POST creates a paper for the authenticated user", async () => {
    const response = await post({
      title: "Sample",
      description: "Demo",
      sourceKey: "sample",
    });
    const payload = await expectOkResponse(response);

    expect(paperMocks.createPaper).toHaveBeenCalledWith("user-1", {
      title: "Sample",
      description: "Demo",
      sourceKey: "sample",
    });
    expect(payload).toMatchObject({
      data: { id: "paper-1", title: "Sample" },
    });
  });

  it("Scenario: unauthenticated POST keeps the existing JSON error style", async () => {
    setUpUnauthenticatedUser(authMocks.requireUserFromRequest);

    const response = await post({ title: "Sample" });

    await expectErrorResponse(response, 401, "UNAUTHORIZED");
    expect(paperMocks.createPaper).not.toHaveBeenCalled();
  });

  it("Scenario: service validation errors are preserved", async () => {
    paperMocks.createPaper.mockRejectedValue(
      new AppError("REQUEST_INVALID", "Invalid", 400),
    );

    const response = await post({ title: "" });

    await expectErrorResponse(response, 400, "REQUEST_INVALID");
  });
});
