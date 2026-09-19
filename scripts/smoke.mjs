import { chromium, expect } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("artifacts", { recursive: true });
const executablePath =
  process.env.BROWSER_PATH ??
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : undefined);
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader"],
});
const errors = [];
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});
page.on("pageerror", (e) => errors.push(e.message));
const shot = async (name) => page.screenshot({ path: `artifacts/${name}.png` });
const closeDialog = () =>
  page.getByRole("button", { name: "Close dialog", exact: true }).click();
const dev = () =>
  page
    .getByRole("button", { name: "Open simulation controls", exact: true })
    .click();
const nav = (name) =>
  page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name, exact: true })
    .click();
const readMoney = (text) => Number(text.replace(/[^0-9.-]/g, ""));
try {
  await page.goto(process.env.BASE_URL ?? "http://localhost:5173");
  await page.waitForSelector("canvas");
  await page.waitForTimeout(2200);
  await expect(
    page.getByRole("heading", {
      name: "Follow the sun. Find your opportunity.",
    }),
  ).toBeVisible();
  await shot("world-mobile");
  const clock = await page.locator(".global-clock strong").textContent();
  await expect
    .poll(() => page.locator(".global-clock strong").textContent())
    .not.toBe(clock);
  await dev();
  await page.getByRole("button", { name: "14:30", exact: true }).click();
  await closeDialog();
  await page
    .getByRole("button", { name: "Explore Istanbul", exact: true })
    .click();
  await expect(page.locator(".selected-index")).toBeVisible();
  await page.waitForTimeout(1500);
  await shot("world-selected-mobile");
  await page
    .getByRole("button", { name: "Enter Istanbul exchange", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Istanbul Exchange" }),
  ).toBeVisible();
  await shot("market-mobile");
  await page
    .locator(".stock-row")
    .filter({ has: page.locator(".stock-identity b", { hasText: "THRA" }) })
    .click();
  await expect(
    page.getByRole("heading", { name: "Thrace Technologies" }),
  ).toBeVisible();
  await shot("stock-mobile");
  await page.getByRole("button", { name: "1M", exact: true }).click();
  await expect(page.locator(".chart-history-note")).toContainText(
    "Illustrative",
  );
  await page.getByRole("button", { name: "1D", exact: true }).click();
  await page.getByRole("button", { name: "Buy THRA", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Quantity" }).fill("99999999");
  await expect(
    page.getByRole("button", { name: "BUY 99999999 THRA", exact: true }),
  ).toBeDisabled();
  await page.getByRole("spinbutton", { name: "Quantity" }).fill("10");
  await shot("order-mobile");
  await page.getByRole("button", { name: "BUY 10 THRA", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Order filled" }),
  ).toBeVisible();
  const buyUSD = readMoney(
    await page
      .locator(".order-success .order-summary")
      .nth(1)
      .locator("b")
      .textContent(),
  );
  await shot("order-filled-mobile");
  await page.getByRole("button", { name: "Continue exploring" }).click();
  await nav("Portfolio");
  await expect(
    page.locator(".stock-row").filter({ hasText: "THRA" }),
  ).toContainText("110 shares");
  await expect(page.locator(".return-grid>div").nth(2).locator("b")).toHaveText(
    "$" +
      (24820 - buyUSD).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
  );
  await shot("portfolio-mobile");
  await page.locator(".stock-row").filter({ hasText: "THRA" }).click();
  await page.getByRole("button", { name: "Sell THRA", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Quantity" }).fill("111");
  await expect(
    page.getByRole("button", { name: "SELL 111 THRA", exact: true }),
  ).toBeDisabled();
  await page.getByRole("spinbutton", { name: "Quantity" }).fill("10");
  await page.getByRole("button", { name: "SELL 10 THRA", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Order filled" }),
  ).toBeVisible();
  const sellUSD = readMoney(
    await page
      .locator(".order-success .order-summary")
      .nth(1)
      .locator("b")
      .textContent(),
  );
  await page.getByRole("button", { name: "Continue exploring" }).click();
  await nav("Portfolio");
  await expect(
    page.locator(".stock-row").filter({ hasText: "THRA" }),
  ).toContainText("100 shares");
  const expectedCash = 24820 - buyUSD + sellUSD;
  await expect(page.locator(".return-grid>div").nth(2).locator("b")).toHaveText(
    "$" +
      expectedCash.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
  );
  await dev();
  await page.getByRole("button", { name: "18:00", exact: true }).click();
  await closeDialog();
  await page.locator(".stock-row").filter({ hasText: "THRA" }).click();
  const closedPrice = await page.locator(".stock-big-price").textContent();
  await page.waitForTimeout(3400);
  await expect(page.locator(".stock-big-price")).toHaveText(closedPrice);
  await page.getByRole("button", { name: "Buy THRA", exact: true }).click();
  await expect(page.locator(".order-error")).toContainText("market is closed");
  await expect(
    page.getByRole("button", { name: /^BUY \d+ THRA$/ }),
  ).toBeDisabled();
  await closeDialog();
  await nav("News");
  await expect(
    page.getByRole("heading", {
      name: "Thrace wins landmark defense electronics contract",
    }),
  ).toBeVisible();
  await shot("news-mobile");
  await page.getByRole("button", { name: "Europe", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Thrace wins landmark defense electronics contract",
    }),
  ).toBeVisible();
  await page
    .locator(".news-feed-card")
    .filter({ hasText: "Thrace wins" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Upward pressure");
  await shot("story-mobile");
  await closeDialog();
  await dev();
  await page.getByRole("button", { name: "global event", exact: true }).click();
  await page.getByRole("button", { name: "600×", exact: true }).click();
  await expect(page.locator(".dev-clock")).toContainText("600× SPEED");
  await shot("developer-mobile");
  await page.getByRole("button", { name: "Realtime", exact: true }).click();
  await page.getByRole("button", { name: "14:30", exact: true }).click();
  await closeDialog();
  await nav("Markets");
  await page
    .getByRole("textbox", { name: "Search markets and companies" })
    .fill("Tokyo");
  await expect(page.locator(".exchange-card")).toHaveCount(1);
  await expect(page.locator(".exchange-city h2")).toHaveText("Tokyo");
  await page
    .getByRole("textbox", { name: "Search markets and companies" })
    .fill("");
  await shot("markets-mobile");
  await nav("World");
  await page.waitForSelector("canvas");
  await page.waitForTimeout(1300);
  await page.getByRole("button", { name: "Explore regions" }).click();
  await page
    .getByRole("button", { name: "Asia 5 financial centers", exact: true })
    .click();
  await page.waitForTimeout(1700);
  await expect(page.locator(".perspective")).toContainText("Asia");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.waitForTimeout(1400);
  await expect(page.locator(".selected-index")).toBeVisible();
  await shot("asia-mobile");
  await page.getByRole("button", { name: "Reset globe", exact: true }).click();
  const bounds = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
  }));
  expect(bounds).toEqual({ width: 390, height: 844 });
  expect(errors).toEqual([]);
  console.log(
    "PASS: globe, clock, discovery, chart periods, buy/sell USD settlement, portfolio, invalid orders, closed market, news, developer controls, search, region focus, mobile overflow.",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(1600);
  await shot("world-desktop");
  await nav("Portfolio");
  await shot("portfolio-desktop");
  await nav("News");
  await shot("news-desktop");
  console.log("Browser errors:", errors);
} finally {
  await browser.close();
}
