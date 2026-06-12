import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

const practiceMocks = vi.hoisted(() => ({
  recordPracticeAnswer: vi.fn(),
}));

vi.mock("@/lib/practice-service", () => ({
  recordPracticeAnswer: practiceMocks.recordPracticeAnswer,
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
});
