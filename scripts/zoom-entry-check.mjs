import { chromium, expect } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ??
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader"],
});
const page = await browser.newPage({
  locale: "en-US",
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const button = (name) => page.getByRole("button", { name, exact: true });
const stop = () =>
  expect(page.locator(".world-page")).toHaveAttribute(
    "data-zoom-limit",
    "true",
  );
try {
  await page.goto(process.env.BASE_URL ?? "http://localhost:5173");
  await page.waitForSelector("canvas");
  await page.waitForTimeout(1200);
  for (let i = 0; i < 4; i++) {
    await button("Zoom in").click();
    await page.waitForTimeout(1400);
    await expect(page.locator(".world-page")).toBeVisible();
  }
  await stop();
  await expect(page.locator(".journey-card")).toContainText(
    "ZOOM AGAIN TO ENTER",
  );
  await button("Türkçe").click();
  await expect(page.locator(".journey-card")).toContainText(
    "GİRMEK İÇİN TEKRAR YAKINLAŞ",
  );
  await page.screenshot({ path: "artifacts/globe-stop-tr.png" });
  await button("English").click();
  await button("Zoom out").click();
  await page.waitForTimeout(1400);
  await expect(page.locator(".world-page")).toHaveAttribute(
    "data-zoom-limit",
    "false",
  );
  await button("Zoom in").click();
  await page.waitForTimeout(1400);
  await stop();
  await button("Zoom in").click();
  await expect(page.locator(".city-title h1")).toBeVisible();
  console.log(
    "PASS: + stops at the limit; zooming out clears the stop; an extra + enters. TR/EN guidance is visible.",
  );

  await page.locator(".planet-back").click();
  await page.waitForTimeout(1500);
  const point = await page
    .locator(".globe-canvas canvas")
    .evaluate((canvas) => {
      for (const y of [420, 450, 490, 390])
        for (const x of [195, 110, 270, 85])
          if (document.elementFromPoint(x, y) === canvas) return { x, y };
      throw new Error("No clear globe gesture target");
    });
  await page.mouse.move(point.x, point.y);
  for (let i = 0; i < 42; i++) {
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(45);
  }
  await stop();
  await expect(page.locator(".expanded-city")).toHaveCount(0);
  await page.waitForTimeout(500);
  await page.mouse.wheel(0, -90);
  await expect(page.locator(".city-title h1")).toBeVisible();
  console.log(
    "PASS: a continuous wheel burst stays on Earth; a separate scroll enters the city.",
  );

  await page.locator(".planet-back").click();
  await page.waitForTimeout(1500);
  await button("Explore Istanbul").click();
  await stop();
  await page.waitForTimeout(700);
  await expect(page.locator(".expanded-city")).toHaveCount(0);
  await button("Zoom in").click();
  await expect(page.locator(".city-title h1")).toHaveText("Istanbul");
  expect(errors).toEqual([]);
  console.log(
    "PASS: a hub selection stops on the globe; extra zoom enters the correct city. No browser errors.",
  );
} catch (error) {
  await page.screenshot({ path: "artifacts/zoom-entry-failure.png" });
  throw error;
} finally {
  await browser.close();
}
