import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const paths = ["/", "/listening", "/grammar", "/mistakes", "/stats", "/settings"];
const username = process.env.SMOKE_USERNAME || "smoke_admin";
const password = process.env.SMOKE_PASSWORD || "SmokePass123";

await page.goto("http://127.0.0.1:3000/login", {
  waitUntil: "networkidle",
});

if (page.url().includes("/login")) {
  await page.getByLabel("用户名").fill(username);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: /登录|创建并登录/ }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 10_000,
  });
  console.log("login=OK");
}

for (const path of paths) {
  await page.goto(`http://127.0.0.1:3000${path}`, {
    waitUntil: "networkidle",
  });
  const text = await page.locator("body").innerText();
  console.log(`${path}=${text.length > 0 ? "TEXT_OK" : "EMPTY"}`);
}

await browser.close();
