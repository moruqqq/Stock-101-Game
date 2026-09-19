import { chromium, expect } from "@playwright/test";
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
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
});
const base = process.env.BASE_URL ?? "http://localhost:5173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto(base);
  await page.waitForSelector("canvas");
  await page.waitForTimeout(1500);
  const cdp = await page.context().newCDPSession(page);
  const touch = async (type, points) =>
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
  await touch("touchStart", [
    [142, 430],
    [248, 430],
  ]);
  for (let i = 1; i <= 8; i++) {
    await touch("touchMove", [
      [142 - i * 9, 430],
      [248 + i * 9, 430],
    ]);
    await page.waitForTimeout(35);
  }
  await touch("touchEnd", []);
  await page.waitForTimeout(1200);
  await expect(page.locator(".selected-index")).toBeVisible();
  await expect(page.locator(".perspective")).not.toContainText("All markets");
  console.log(
    "PASS: actual two-finger touch pinch reveals regional/city information",
  );
  await page.getByRole("button", { name: "Reset globe", exact: true }).click();
  await page.waitForTimeout(1500);
  const before = await page
    .getByRole("button", { name: "Explore Istanbul", exact: true })
    .boundingBox();
  await touch("touchStart", [[190, 460]]);
  for (let i = 1; i <= 6; i++) {
    await touch("touchMove", [[190 + i * 13, 460 + i * 2]]);
    await page.waitForTimeout(35);
  }
  await touch("touchEnd", []);
  await page.waitForTimeout(900);
  const after = await page
    .getByRole("button", { name: "Explore Istanbul", exact: true })
    .boundingBox();
  expect(Math.abs((after?.x ?? 0) - (before?.x ?? 0))).toBeGreaterThan(20);
  console.log("PASS: one-finger drag rotates the globe");
  await page.getByRole("button", { name: "Reset globe", exact: true }).click();
  await page.waitForTimeout(1400);
  await page
    .getByRole("button", { name: "Explore Istanbul", exact: true })
    .click();
  await page.waitForTimeout(2000);
  await expect(page.locator(".local-story-preview")).toContainText("Thrace");
  expect(
    await page.locator(".world-page").evaluate((el) => el.scrollLeft),
  ).toBe(0);
  const heading = await page.locator(".world-top h1").boundingBox();
  expect(heading.x).toBeGreaterThanOrEqual(20);
  await page.screenshot({ path: "artifacts/world-selected-fixed.png" });
  console.log(
    "PASS: focused hub does not scroll the world; local news preview revealed",
  );
  await page.getByRole("button", { name: "Reset globe", exact: true }).click();
  await page.waitForTimeout(1400);
  // Browser emulation of a 59px top / 34px bottom safe-area budget; native safe areas still require Xcode QA.
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
    "PASS: safe-area budget and smaller phone layout; no browser errors",
  );
} finally {
  await browser.close();
}
