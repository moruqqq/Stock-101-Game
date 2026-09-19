import { chromium } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader"],
});
for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["iphone", 390, 844],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: name === "iphone",
    hasTouch: name === "iphone",
  });
  page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
  await page.goto("http://localhost:5173");
  await page.waitForSelector("canvas");
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `artifacts/${name}.png` });
  console.log(
    name,
    await page.locator("canvas").boundingBox(),
    await page
      .locator("body")
      .evaluate((el) => ({ width: el.scrollWidth, height: el.scrollHeight })),
  );
  await page.close();
}
await browser.close();
