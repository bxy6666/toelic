import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import {
  createPostJsonAction,
  expectErrorResponse,
  expectOkResponse,
  setUpAuthenticatedUser,
  setUpUnauthenticatedUser,
} from "../test-utils";

const practiceMocks = vi.hoisted(() => ({
  recordPracticeAnswer: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  requireUserFromRequest: vi.fn(),
}));

vi.mock("@/lib/practice-service", () => ({
  recordPracticeAnswer: practiceMocks.recordPracticeAnswer,
}));

vi.mock("@/lib/auth", () => ({
  requireUserFromRequest: authMocks.requireUserFromRequest,
}));

const post = createPostJsonAction("http://localhost/api/practice-records", () =>
  import("@/app/api/practice-records/route"),
);

function setUp() {
  setUpAuthenticatedUser(authMocks.requireUserFromRequest);
  practiceMocks.recordPracticeAnswer.mockResolvedValue({
    result: {
      questionId: "question-1",
      userAnswer: "A",
      isCorrect: true,
    },
  });
}

beforeEach(setUp);

describe("Acceptance: POST /api/practice-records", () => {
  it("Scenario: missing answer fields are rejected before service work", async () => {
    const response = await post({ questionId: "", userAnswer: "A" });

    await expectErrorResponse(response, 400, "REQUEST_INVALID");
    expect(practiceMocks.recordPracticeAnswer).not.toHaveBeenCalled();
  });

  it("Scenario: valid answers are trimmed and submitted to the service", async () => {
    const response = await post({
      questionId: " question-1 ",
      userAnswer: " a ",
      timeSpentSeconds: 9,
    });

    await expectOkResponse(response);
    expect(practiceMocks.recordPracticeAnswer).toHaveBeenCalledWith({
      questionId: "question-1",
      userId: "user-1",
      userAnswer: "a",
      timeSpentSeconds: 9,
    });
  });

  it("Scenario: service AppError responses keep their status and code", async () => {
    practiceMocks.recordPracticeAnswer.mockRejectedValue(
      new AppError("REQUEST_INVALID", "Question missing", 404),
    );

    const response = await post({
      questionId: "missing",
      userAnswer: "A",
    });

    await expectErrorResponse(response, 404, "REQUEST_INVALID");
  });

  it("Scenario: unauthenticated requests stop before recording answers", async () => {
    setUpUnauthenticatedUser(authMocks.requireUserFromRequest);

    const response = await post({
      questionId: "question-1",
      userAnswer: "A",
    });

    await expectErrorResponse(response, 401, "UNAUTHORIZED");
    expect(practiceMocks.recordPracticeAnswer).not.toHaveBeenCalled();
  });
});
