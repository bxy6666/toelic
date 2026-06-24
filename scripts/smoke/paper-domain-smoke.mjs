import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const smokeUsername = process.env.SMOKE_USERNAME || "smoke_admin";
const smokePassword = process.env.SMOKE_PASSWORD || "SmokePass123";
const seedSourceKey = "toeic-sample-001";

const results = {
  baseUrl,
  seedSourceKey,
  attemptId: "",
  total: 0,
  correct: 0,
  wrong: 0,
  unanswered: 0,
  autosaveReload: false,
  submitIdempotency: false,
  publishedReadonly: false,
};

function url(path) {
  return new URL(path, baseUrl).toString();
}

function fail(message) {
  const error = new Error(message);
  error.smokeFailure = true;
  throw error;
}

async function gotoPage(page, path) {
  await page.goto(url(path), { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
}

async function login(context) {
  const response = await fetch(url("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: smokeUsername, password: smokePassword }),
  }).catch((error) => {
    fail(`Dev server is not reachable at ${baseUrl}: ${error.message}`);
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    const message = payload?.error?.message || response.statusText;
    fail(
      `No usable smoke user. Login failed for "${smokeUsername}": ${message}. ` +
        "Create a user or set SMOKE_USERNAME/SMOKE_PASSWORD, then run npm run seed:papers for that user.",
    );
  }

  const setCookie = response.headers.get("set-cookie");
  const sessionCookie = setCookie?.split(";")[0];
  if (!sessionCookie) {
    fail("Login succeeded but no session cookie was returned.");
  }

  const [name, value] = sessionCookie.split("=");
  const cookieUrls = new Set([baseUrl]);
  const parsedBaseUrl = new URL(baseUrl);
  if (parsedBaseUrl.hostname === "127.0.0.1") {
    cookieUrls.add(`${parsedBaseUrl.protocol}//localhost:${parsedBaseUrl.port || "80"}`);
  } else if (parsedBaseUrl.hostname === "localhost") {
    cookieUrls.add(`${parsedBaseUrl.protocol}//127.0.0.1:${parsedBaseUrl.port || "80"}`);
  }

  await context.addCookies(
    [...cookieUrls].map((cookieUrl) => ({ name, value, url: cookieUrl })),
  );
}

async function expectVisible(locator, message) {
  if (!(await locator.isVisible({ timeout: 20_000 }).catch(() => false))) {
    fail(message);
  }
}

async function expectAttribute(locator, name, expected, message) {
  const value = await locator.getAttribute(name, { timeout: 20_000 }).catch(() => null);
  if (value !== expected) {
    fail(`${message}. Expected ${name}=${expected}, got ${value ?? "<null>"}.`);
  }
}

async function waitForAttemptId(page) {
  await page.waitForFunction(
    () => {
      const element = document.querySelector('[data-testid="paper-take-workspace"]');
      return Boolean(element?.getAttribute("data-attempt-id"));
    },
    null,
    { timeout: 30_000 },
  );
  return page.getByTestId("paper-take-workspace").getAttribute("data-attempt-id");
}

async function verifyPublishedReadonly(page, versionId) {
  await gotoPage(page, `/paper-versions/${versionId}/edit`);
  await expectVisible(
    page.getByTestId("version-readonly-notice"),
    "Published edit page did not show a read-only notice.",
  );

  const unavailable = [
    "add-section-form",
    "add-item-form",
    "publish-version-button",
  ];
  for (const testId of unavailable) {
    const count = await page.getByTestId(testId).count();
    if (count !== 0) {
      fail(`Published edit page still exposes ${testId}.`);
    }
  }

  const editableControls = await page
    .getByTestId("edit-item-form")
    .first()
    .locator("input, select, textarea, button")
    .evaluateAll((controls) =>
      controls.filter(
        (control) =>
          !control.disabled && control.getAttribute("aria-disabled") !== "true",
      ).length,
    )
    .catch(() => 0);
  if (editableControls > 0) {
    fail("Published edit page still has enabled item edit controls.");
  }

  const response = await page.request.post(url(`/api/paper-versions/${versionId}/items`), {
    data: {
      questionNo: "SMOKE-LOCKED",
      stem: "This mutation must be rejected.",
      answerChoice: "A",
      options: ["A", "B", "C", "D"].map((optionKey, index) => ({
        optionKey,
        optionText: `Option ${optionKey}`,
        orderIndex: index + 1,
      })),
    },
  });
  const payload = await response.json().catch(() => null);
  if (payload?.ok !== false || payload?.error?.code !== "VERSION_NOT_EDITABLE") {
    fail(
      `Published direct edit API did not return VERSION_NOT_EDITABLE: ${JSON.stringify(
        payload,
      ).slice(0, 300)}`,
    );
  }

  results.publishedReadonly = true;
}

async function run() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    await login(context);

    await gotoPage(page, "/papers");
    if (new URL(page.url()).pathname.startsWith("/login")) {
      fail("Login did not produce a usable browser session.");
    }

    await expectVisible(page.getByTestId("papers-list"), "Papers list was not visible.");
    const paperCard = page.getByTestId(`paper-card-${seedSourceKey}`);
    await expectVisible(
      paperCard,
      `Seed paper ${seedSourceKey} was not visible. Run npm run seed:papers first, using the same smoke user.`,
    );

    const detailHref = await paperCard.locator("a[href^='/papers/']").first().getAttribute("href");
    if (!detailHref) {
      fail(`Seed paper ${seedSourceKey} did not expose a detail link.`);
    }
    await gotoPage(page, detailHref);

    const publishedStatus = page.getByTestId("version-status-published").first();
    await expectVisible(publishedStatus, "Seed paper does not have a published version.");
    const versionId = await publishedStatus.getAttribute("data-version-id");
    if (!versionId) {
      fail("Published version status did not expose data-version-id.");
    }

    await verifyPublishedReadonly(page, versionId);

    await gotoPage(page, `/paper-versions/${versionId}/take`);
    await expectVisible(
      page.getByTestId("start-attempt-button"),
      "Start attempt button was not visible.",
    );
    await page.getByTestId("start-attempt-button").click();
    const attemptId = await waitForAttemptId(page);
    if (!attemptId) {
      fail("Attempt was not created.");
    }
    results.attemptId = attemptId;

    await page.getByTestId("answer-101-B").click();
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await page.getByTestId("answer-102-A").click();
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await expectAttribute(
      page.getByTestId("autosave-status"),
      "data-status",
      "saved",
      "Autosave did not reach saved state.",
    );

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await expectAttribute(
      page.getByTestId("answer-101-B"),
      "aria-pressed",
      "true",
      "Reload did not preserve question 101 answer.",
    );
    await expectAttribute(
      page.getByTestId("answer-102-A"),
      "aria-pressed",
      "true",
      "Reload did not preserve question 102 answer.",
    );
    results.autosaveReload = true;

    await page.getByTestId("submit-attempt-button").click();
    await page.waitForURL(/\/attempts\/.+\/report$/, { timeout: 30_000 });

    const repeatSubmit = await page.request.post(url(`/api/attempts/${attemptId}/submit`));
    const repeatPayload = await repeatSubmit.json().catch(() => null);
    if (!repeatSubmit.ok() || repeatPayload?.ok !== true) {
      fail(`Repeated submit was not idempotent: ${JSON.stringify(repeatPayload).slice(0, 300)}`);
    }
    results.submitIdempotency = true;

    const reportSummary = page.getByTestId("report-summary");
    await expectVisible(reportSummary, "Report summary was not visible.");
    results.total = Number(await reportSummary.getAttribute("data-total"));
    results.correct = Number(await reportSummary.getAttribute("data-correct"));
    results.wrong = Number(await reportSummary.getAttribute("data-wrong"));
    results.unanswered = Number(await reportSummary.getAttribute("data-unanswered"));

    if (
      results.total !== 3 ||
      results.correct !== 1 ||
      results.wrong !== 1 ||
      results.unanswered !== 1
    ) {
      fail(
        `Unexpected report summary: total=${results.total}, correct=${results.correct}, wrong=${results.wrong}, unanswered=${results.unanswered}.`,
      );
    }

    await expectVisible(page.getByTestId("report-item-correct"), "Correct report item missing.");
    await expectVisible(page.getByTestId("report-item-wrong"), "Wrong report item missing.");
    await expectVisible(
      page.getByTestId("report-item-unanswered"),
      "Unanswered report item missing.",
    );
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error.smokeFailure ? error.message : error);
  console.log(JSON.stringify(results, null, 2));
  process.exitCode = 1;
});
