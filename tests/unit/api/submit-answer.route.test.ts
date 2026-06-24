import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

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

async function post(body: unknown) {
  const { POST } = await import("@/app/api/practice-records/route");

  return POST(
    new Request("http://localhost/api/practice-records", {
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
  practiceMocks.recordPracticeAnswer.mockResolvedValue({
    result: {
      questionId: "question-1",
      userAnswer: "A",
      isCorrect: true,
    },
  });
});

describe("POST /api/practice-records", () => {
  it("rejects missing questionId or userAnswer", async () => {
    const response = await post({ questionId: "", userAnswer: "A" });
    const payload = await readJson(response);

    expect(response.status).toBe(400);
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "REQUEST_INVALID" },
    });
    expect(practiceMocks.recordPracticeAnswer).not.toHaveBeenCalled();
  });

  it("submits answer data to the practice service", async () => {
    const response = await post({
      questionId: " question-1 ",
      userAnswer: " a ",
      timeSpentSeconds: 9,
    });
    const payload = await readJson(response);

    expect(response.status).toBe(200);
    expect(practiceMocks.recordPracticeAnswer).toHaveBeenCalledWith({
      questionId: "question-1",
      userId: "user-1",
      userAnswer: "a",
      timeSpentSeconds: 9,
    });
    expect(payload).toMatchObject({ ok: true });
  });

  it("returns service AppError responses", async () => {
    practiceMocks.recordPracticeAnswer.mockRejectedValue(
      new AppError("REQUEST_INVALID", "Question missing", 404),
    );

    const response = await post({
      questionId: "missing",
      userAnswer: "A",
    });
    const payload = await readJson(response);

    expect(response.status).toBe(404);
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "REQUEST_INVALID" },
    });
  });

  it("rejects unauthenticated requests", async () => {
    authMocks.requireUserFromRequest.mockRejectedValue(
      new AppError("UNAUTHORIZED", "Login required", 401),
    );

    const response = await post({
      questionId: "question-1",
      userAnswer: "A",
    });
    const payload = await readJson(response);

    expect(response.status).toBe(401);
    expect(payload).toMatchObject({
      ok: false,
      error: { code: "UNAUTHORIZED" },
    });
    expect(practiceMocks.recordPracticeAnswer).not.toHaveBeenCalled();
  });
});
