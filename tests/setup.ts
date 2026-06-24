import { afterEach, vi } from "vitest";

// Equivalent to JUnit @After: reset shared state after every test case.
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
