import { chromium } from "playwright";

const baseUrl = process.env.PUBLIC_BASE_URL || "http://127.0.0.1:3000";
const paths = ["/", "/listening", "/grammar", "/mistakes", "/stats", "/settings"];
const navTargets = [
  ["/", "TOEIC Practice Studio"],
  ["/listening", "听力练习"],
  ["/grammar", "语法练习"],
  ["/mistakes", "错题本"],
  ["/stats", "学习统计"],
  ["/settings", "设置"],
];

const results = [];
const failures = [];
const networkIssues = [];
const consoleIssues = [];
const pageErrors = [];

function pass(name, detail = "") {
  results.push({ status: "PASS", name, detail });
  console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
}

function skip(name, detail = "") {
  results.push({ status: "SKIP", name, detail });
  console.log(`SKIP ${name}${detail ? ` - ${detail}` : ""}`);
}

function fail(name, detail = "") {
  const message = `${name}${detail ? ` - ${detail}` : ""}`;
  failures.push(message);
  results.push({ status: "FAIL", name, detail });
  console.log(`FAIL ${message}`);
}

function pageUrl(path) {
  return new URL(path, baseUrl).toString();
}

async function gotoPage(page, path) {
  await page.goto(pageUrl(path), {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForLoadState("networkidle", { timeout: 90000 }).catch(() => {});

  const cloudflareVisit = page.getByRole("button", { name: /visit site/i });
  if (await cloudflareVisit.isVisible().catch(() => false)) {
    await cloudflareVisit.click();
    await page.waitForLoadState("networkidle", { timeout: 90000 }).catch(() => {});
  }
}

async function expectText(page, text, name) {
  await page.waitForFunction(
    (expectedText) => document.body?.innerText.includes(expectedText),
    text,
    { timeout: 60000 },
  );
  pass(name);
}

async function checkActionability(page, path, viewportName) {
  await gotoPage(page, path);
  await page.screenshot({
    path: `output/playwright/public-${viewportName}-${path === "/" ? "home" : path.slice(1)}.png`,
    fullPage: true,
  });

  const targets = page.locator("a[href], button, [role='button'], [data-slot='select-trigger']");
  const count = await targets.count();
  let checked = 0;

  for (let index = 0; index < count; index += 1) {
    const target = targets.nth(index);
    if (!(await target.isVisible().catch(() => false))) {
      continue;
    }

    const disabled = await target
      .evaluate((element) => {
        const htmlElement = element;
        return Boolean(
          htmlElement.disabled ||
            htmlElement.getAttribute("aria-disabled") === "true" ||
            htmlElement.closest("[disabled]"),
        );
      })
      .catch(() => false);

    if (disabled) {
      continue;
    }

    const label = (
      (await target.innerText().catch(() => "")) ||
      (await target.getAttribute("aria-label").catch(() => "")) ||
      (await target.getAttribute("href").catch(() => "")) ||
      `${path}#${index}`
    )
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 80);

    try {
      await target.click({ trial: true, timeout: 8000 });
      checked += 1;
    } catch (error) {
      fail(
        `可点击性 ${viewportName} ${path}`,
        `${label || `element ${index}`}: ${error.message}`,
      );
    }
  }

  pass(`可点击性 ${viewportName} ${path}`, `${checked} 个可见控件通过 trial click`);
}

async function assertApi(page, path, name) {
  const payload = await page.evaluate(async (apiPath) => {
    const response = await fetch(apiPath, { cache: "no-store" });
    const text = await response.text();
    let body = null;

    try {
      body = JSON.parse(text);
    } catch {
      body = { ok: false, raw: text.slice(0, 300) };
    }

    return {
      status: response.status,
      body,
    };
  }, path);

  if (payload.status >= 400 || !payload.body?.ok) {
    fail(name, JSON.stringify(payload).slice(0, 300));
    return null;
  }

  pass(name);
  return payload.body.data;
}

async function navFlow(page) {
  await gotoPage(page, "/");
  for (const [path, text] of navTargets) {
    await page.locator(`nav a[href='${path}']`).first().click();
    await page.waitForURL(new RegExp(`${path === "/" ? "/$" : path}`), {
      timeout: 30000,
    });
    await expectText(page, text, `导航到 ${path}`);
  }

  await gotoPage(page, "/");
  await page.locator("a[href='/listening']").nth(1).click();
  await page.waitForURL(/\/listening$/, { timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await expectText(page, "生成设置", "首页开始听力入口");

  await gotoPage(page, "/");
  await page.locator("a[href='/grammar']").nth(1).click();
  await page.waitForURL(/\/grammar$/, { timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await expectText(page, "生成设置", "首页开始语法入口");

  await gotoPage(page, "/");
  await page.locator("a[href='/grammar']").nth(2).click();
  await page.waitForURL(/\/grammar$/, { timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await expectText(page, "语法练习", "首页今日计划入口");
}

async function setNumberInput(page, label, value) {
  const input = page.getByLabel(label).first();
  await input.click();
  await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await input.type(String(value));
  await page.waitForTimeout(150);
}

async function waitForSettingsSaveEnabled(page, required = true) {
  const saveButton = page.getByRole("button", { name: /保存设置/ });
  const enabled = await page
    .waitForFunction(() => {
      return [...document.querySelectorAll("button")].some(
        (button) => button.innerText.includes("保存设置") && !button.disabled,
      );
    }, null, { timeout: 5000 })
    .then(() => true)
    .catch(() => false);

  if (!enabled && required) {
    throw new Error("保存设置按钮未启用");
  }

  return { saveButton, enabled };
}

async function selectFirstAlternateOption(page, index = 0) {
  const trigger = page.locator("[data-slot='select-trigger']").nth(index);
  await trigger.click();
  const options = page.locator("[data-slot='select-item']");
  const optionCount = await options.count();
  if (optionCount > 1) {
    await options.nth(1).click();
  } else if (optionCount === 1) {
    await options.first().click();
  }
}

async function generateAndSubmit(page, path, label) {
  await gotoPage(page, path);
  await selectFirstAlternateOption(page, 0);
  await selectFirstAlternateOption(page, 1);
  await setNumberInput(page, "题量", 1);

  if (path === "/grammar") {
    await page.getByLabel("语法点").fill("时态");
  }

  await page.getByLabel("标签").fill("public-smoke");

  const generateResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/ai/generate-questions") &&
      response.request().method() === "POST",
    { timeout: 180000 },
  );
  await page.getByRole("button", { name: /生成题目/ }).click();
  const generateResponse = await generateResponsePromise;

  if (generateResponse.status() >= 400) {
    const text = await generateResponse.text().catch(() => "");
    fail(`${label}生成题目`, `${generateResponse.status()} ${text.slice(0, 300)}`);
    return;
  }

  await expectText(page, "第 1 / 1 题", `${label}生成题目`);

  if (path === "/listening") {
    await page.getByRole("button", { name: /播放|重播/ }).click({ timeout: 10000 });
    await page.getByRole("button", { name: "停止" }).click({ timeout: 10000 });
    pass("听力播放与停止按钮");
  }

  await page.getByRole("button", { name: /^A/ }).first().click();
  const submitResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/practice-records") &&
      response.request().method() === "POST",
    { timeout: 60000 },
  );
  await page.getByRole("button", { name: /提交答案/ }).click();
  const submitResponse = await submitResponsePromise;

  if (submitResponse.status() >= 400) {
    const text = await submitResponse.text().catch(() => "");
    fail(`${label}提交答案`, `${submitResponse.status()} ${text.slice(0, 300)}`);
    return;
  }

  await expectText(page, "本组完成", `${label}答题完成面板`);
}

async function settingsFlow(page) {
  await gotoPage(page, "/settings");
  const settings = await assertApi(page, "/api/settings", "设置 API");
  if (!settings) {
    return;
  }

  await page.getByRole("button", { name: /刷新/ }).click();
  pass("设置刷新按钮");

  const nextCount = settings.defaultQuestionCount === 1 ? 2 : 1;
  await setNumberInput(page, "默认题量", nextCount);
  const firstSave = await waitForSettingsSaveEnabled(page);
  const saveResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/settings") &&
      response.request().method() === "PATCH",
    { timeout: 60000 },
  );
  await firstSave.saveButton.click();
  const saveResponse = await saveResponsePromise;
  if (saveResponse.status() >= 400) {
    fail("设置保存按钮", `${saveResponse.status()} ${await saveResponse.text()}`);
  } else {
    await expectText(page, "设置已保存", "设置保存按钮");
  }

  await setNumberInput(page, "默认题量", settings.defaultQuestionCount);
  const restoreSave = await waitForSettingsSaveEnabled(page, false);
  if (restoreSave.enabled) {
    await restoreSave.saveButton.click();
    await expectText(page, "设置已保存", "设置恢复原值");
  } else {
    const restoreResponse = await page.evaluate(async (originalSettings) => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultDifficulty: originalSettings.defaultDifficulty,
          defaultQuestionCount: originalSettings.defaultQuestionCount,
          speechRate: originalSettings.speechRate,
        }),
      });
      return { status: response.status, body: await response.json() };
    }, settings);

    if (restoreResponse.status >= 400 || !restoreResponse.body?.ok) {
      fail("设置恢复原值", JSON.stringify(restoreResponse).slice(0, 300));
    } else {
      pass("设置恢复原值", "UI 已是原值，使用 API 兜底确认");
    }
  }

  await page.getByRole("button", { name: /清除学习数据/ }).click();
  await expectText(page, "确认清除本地学习数据", "清除数据弹窗打开");
  await page.getByRole("button", { name: /确认清除/ }).click({ trial: true });
  await page.getByRole("button", { name: "取消" }).click();
  pass("清除数据确认按钮可点击但未执行");
}

async function mistakesFlow(page) {
  await gotoPage(page, "/mistakes");
  const mistakes = await assertApi(page, "/api/mistakes", "错题 API");
  await page.getByRole("button", { name: /应用筛选/ }).click();
  pass("错题筛选按钮");

  if (!Array.isArray(mistakes) || mistakes.length === 0) {
    skip("错题重新练习流程", "当前没有错题记录");
    return;
  }

  await page.getByRole("button", { name: /重新练习/ }).first().click();
  await expectText(page, "重新练习", "错题重新练习展开");
  await page.getByRole("button", { name: /^A/ }).first().click();
  const retryResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/practice-records") &&
      response.request().method() === "POST",
    { timeout: 60000 },
  );
  await page.getByRole("button", { name: /提交复练/ }).click();
  const retryResponse = await retryResponsePromise;
  if (retryResponse.status() >= 400) {
    fail("错题提交复练", `${retryResponse.status()} ${await retryResponse.text()}`);
  } else {
    await expectText(page, "正确答案", "错题提交复练");
  }

  await page.getByRole("button", { name: /已掌握/ }).first().click({ trial: true });
  await page.getByRole("button", { name: /移除/ }).first().click({ trial: true });
  pass("错题已掌握/移除按钮可点击但未执行");
}

async function statsFlow(page) {
  await gotoPage(page, "/stats");
  await assertApi(page, "/api/stats", "统计 API");
  await expectText(page, "最近7天", "统计图表区");
  await expectText(page, "薄弱标签", "统计薄弱标签区");
}

async function run() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes("favicon.ico")) {
      networkIssues.push(`${status} ${url}`);
    }
  });
  page.on("requestfailed", (request) => {
    const errorText = request.failure()?.errorText || "request failed";
    const url = request.url();

    if (errorText === "net::ERR_ABORTED" && url.includes("_rsc=")) {
      return;
    }

    networkIssues.push(`${errorText} ${url}`);
  });
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().includes("favicon") &&
      !message.text().includes("Failed to load resource")
    ) {
      consoleIssues.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await gotoPage(page, "/");
  await assertApi(page, "/api/settings", "公网 API 连通");

  for (const path of paths) {
    await checkActionability(page, path, "desktop");
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of paths) {
    await checkActionability(page, path, "mobile");
  }
  await page.setViewportSize({ width: 1280, height: 900 });

  await navFlow(page);
  await generateAndSubmit(page, "/grammar", "语法");
  await generateAndSubmit(page, "/listening", "听力");
  await mistakesFlow(page);
  await settingsFlow(page);
  await statsFlow(page);

  await browser.close();

  for (const issue of [...new Set(networkIssues)]) {
    fail("网络请求异常", issue);
  }
  for (const issue of [...new Set(consoleIssues)]) {
    fail("控制台错误", issue);
  }
  for (const issue of [...new Set(pageErrors)]) {
    fail("页面运行错误", issue);
  }

  const summary = {
    baseUrl,
    total: results.length,
    pass: results.filter((item) => item.status === "PASS").length,
    skip: results.filter((item) => item.status === "SKIP").length,
    fail: failures.length,
    failures,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
