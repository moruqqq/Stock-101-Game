import { chromium, expect } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ??
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : undefined),
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
try {
  await page.goto(process.env.BASE_URL ?? "http://localhost:5173");
  await page.waitForSelector("canvas");
  await page.waitForTimeout(1800);
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, points) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map(([x, y], i) => ({
        x,
        y,
        id: i,
        radiusX: 5,
        radiusY: 5,
        force: 1,
      })),
    });
  const pinch = async (start, end) => {
    await touch("touchStart", [
      [195 - start, 430],
      [195 + start, 430],
    ]);
    for (let i = 1; i <= 10; i++) {
      const dx = start + ((end - start) * i) / 10;
      await touch("touchMove", [
        [195 - dx, 430],
        [195 + dx, 430],
      ]);
      await page.waitForTimeout(50);
    }
    await touch("touchEnd", []);
    await page.waitForTimeout(1200);
  };
  await pinch(70, 109);
  await expect(page.locator(".perspective")).not.toContainText(
    "Whole wide world",
  );
  await expect(page.locator(".journey-card")).toContainText("REGIONAL VIEW");
  console.log("PASS: two-finger pinch progressively reveals a region.");
  await pinch(60, 100);
  await pinch(60, 115);
  await expect(page.locator(".world-page")).toHaveAttribute(
    "data-zoom-limit",
    "true",
  );
  await expect(page.locator(".expanded-city")).toHaveCount(0);
  await page.waitForTimeout(800);
  await expect(page.locator(".world-page")).toBeVisible();
  await page.screenshot({ path: "artifacts/globe-zoom-stop.png" });
  await pinch(60, 94);
  await expect(page.locator(".city-title h1")).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole("button", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/gesture-enter-city.png" });
  const cityPin = page.getByRole("button", {
    name: "Inspect Galata Tower",
    exact: true,
  });
  const cityBefore = await cityPin.boundingBox();
  await touch("touchStart", [[180, 440]]);
  for (let i = 1; i <= 7; i++) {
    await touch("touchMove", [[180 + i * 12, 440 + i * 2]]);
    await page.waitForTimeout(45);
  }
  await touch("touchEnd", []);
  await page.waitForTimeout(900);
  const cityAfter = await cityPin.boundingBox();
  expect(
    Math.abs(cityAfter.x - cityBefore.x) + Math.abs(cityAfter.y - cityBefore.y),
  ).toBeGreaterThan(10);
  await page
    .getByRole("button", { name: "Collapse city details", exact: true })
    .click();
  await pinch(60, 130);
  await pinch(60, 130);
  await expect(page.locator(".expanded-city")).toHaveAttribute(
    "data-level",
    "street",
  );
  await pinch(125, 55);
  await pinch(125, 55);
  await pinch(125, 55);
  await expect(page.locator(".world-page")).toBeVisible({ timeout: 15000 });
  await page
    .getByRole("button", { name: "Visit Istanbul", exact: true })
    .click();
  await expect(page.locator(".city-title h1")).toHaveText("Istanbul", {
    timeout: 15000,
  });

  console.log(
    "PASS: pinch stops on Earth at maximum zoom; a separate pinch enters the city. City drag and zoom work.",
  );
  await page.locator(".planet-back").click();
  await page.waitForTimeout(1600);
  const ist = page.getByRole("button", {
    name: "Explore Istanbul",
    exact: true,
  });
  const before = await ist.boundingBox();
  await touch("touchStart", [[190, 440]]);
  for (let i = 1; i <= 6; i++) {
    await touch("touchMove", [[190 + i * 13, 440 + i * 2]]);
    await page.waitForTimeout(45);
  }
  await touch("touchEnd", []);
  await page.waitForTimeout(900);
  const after = await ist.boundingBox();
  expect(Math.abs((after?.x ?? 0) - (before?.x ?? 0))).toBeGreaterThan(20);
  console.log("PASS: one-finger drag rotates the globe.");
  await page.getByRole("button", { name: "Reset globe", exact: true }).click();
  await page.waitForTimeout(1400);
  // An explicit city shortcut still enters the requested city directly.
  await page.getByRole("button", { name: "Visit Tokyo", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Tokyo" })).toBeVisible({
    timeout: 15000,
  });
  await page.locator(".planet-back").click();
  await page.waitForTimeout(1400);
  expect(
    await page.locator(".world-page").evaluate((el) => el.scrollLeft),
  ).toBe(0);
  await page.addStyleTag({
    content:
      ".topbar{height:123px;padding-top:59px}.bottom-nav{height:100px;padding-bottom:34px}",
  });
  await page.screenshot({ path: "artifacts/world-safe-area.png" });
  const nav = await page.locator(".bottom-nav").boundingBox();
  expect(nav.y + nav.height).toBe(844);
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: "artifacts/world-small-safe-area.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    375,
  );
  expect(errors).toEqual([]);
  console.log(
    "PASS: explicit city shortcuts, safe-area budget, small-phone bounds; no browser errors.",
  );
} catch (e) {
  await page.screenshot({ path: "artifacts/gesture-failure.png" });
  throw e;
} finally {
  await browser.close();
}
