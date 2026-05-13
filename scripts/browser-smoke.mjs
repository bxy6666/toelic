import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const paths = ["/", "/listening", "/grammar", "/mistakes", "/stats", "/settings"];

for (const path of paths) {
  await page.goto(`http://127.0.0.1:3000${path}`, {
    waitUntil: "networkidle",
  });
  const text = await page.locator("body").innerText();
  console.log(`${path}=${text.length > 0 ? "TEXT_OK" : "EMPTY"}`);
}

await browser.close();
