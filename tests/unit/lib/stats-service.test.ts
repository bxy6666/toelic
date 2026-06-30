import { describe, expect, it } from "vitest";

import { summarizeDailyRecords } from "@/lib/stats-service";

describe("summarizeDailyRecords", () => {
  it("Scenario: aggregates the last seven days with empty days preserved", () => {
    const startDate = new Date(2026, 5, 23);
    const records = [
      { practicedAt: new Date(2026, 5, 23, 9), isCorrect: true },
      { practicedAt: new Date(2026, 5, 23, 10), isCorrect: false },
      { practicedAt: new Date(2026, 5, 25, 11), isCorrect: true },
      { practicedAt: new Date(2026, 5, 29, 12), isCorrect: true },
      { practicedAt: new Date(2026, 5, 29, 13), isCorrect: true },
    ];

    expect(summarizeDailyRecords(records, startDate, 7)).toEqual([
      { date: "2026-06-23", count: 2, correct: 1 },
      { date: "2026-06-24", count: 0, correct: 0 },
      { date: "2026-06-25", count: 1, correct: 1 },
      { date: "2026-06-26", count: 0, correct: 0 },
      { date: "2026-06-27", count: 0, correct: 0 },
      { date: "2026-06-28", count: 0, correct: 0 },
      { date: "2026-06-29", count: 2, correct: 2 },
    ]);
  });
});
