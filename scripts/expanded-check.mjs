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
const shot = (n) =>
  page.screenshot({ path: "artifacts/expanded-" + n + ".png" });
const nav = (name) =>
  page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name, exact: true })
    .click();
const theme = async (name) => {
  await page
    .getByRole("button", { name: "Choose appearance", exact: true })
    .click();
  await page
    .getByRole("group", { name: "Appearance" })
    .getByRole("button", { name, exact: true })
    .click();
  await page.waitForTimeout(600);
};
try {
  await page.goto(process.env.BASE_URL ?? "http://localhost:4173");
  await page.waitForSelector("canvas");
  await page.waitForTimeout(1800);
  await shot("world-light");
  await page
    .getByRole("button", { name: "Visit Istanbul", exact: true })
    .click();
  await expect(page.locator(".city-title h1")).toHaveText("Istanbul", {
    timeout: 15000,
  });
  await page.waitForTimeout(1800);
  await shot("istanbul-light");
  await page
    .getByRole("button", { name: "Galata & Karaköy", exact: true })
    .click();
  await expect(page.locator(".expanded-city")).toHaveAttribute(
    "data-level",
    "street",
    { timeout: 12000 },
  );
  await page.waitForTimeout(1400);
  await shot("istanbul-streets");
  await theme("Mid");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "mid");
  await shot("istanbul-mid");
  await theme("Dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await shot("istanbul-dark");
  await nav("News");
  await expect(
    page.getByRole("heading", { name: "The world, as it develops." }),
  ).toBeVisible();
  await page.waitForTimeout(1500);
  await shot("news-dark");
  await page.getByRole("textbox", { name: "Search news" }).fill("coffee");
  await page.waitForTimeout(400);
  await expect(page.locator(".feature-news")).toContainText("coffee");
  await page.locator(".news-headline-button").click();
  await expect(page.getByRole("dialog")).toContainText(
    "The caffeine transition",
  );
  await expect(page.getByRole("dialog")).not.toContainText("Funny news");
  await shot("report-dark");
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await theme("Light");
  await page
    .getByRole("button", { name: "Open simulation controls", exact: true })
    .click();
  await page
    .getByRole("button", { name: "next dispatch", exact: true })
    .click();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "German manufacturers certify engines powered by unrefined coffee",
      exact: true,
    }),
  ).toBeVisible();
  await page.waitForTimeout(1000);
  await shot("coffee-engine");
  await page.locator(".news-headline-button").click();
  await expect(page.locator(".report-chain")).toContainText("Brazil discovers");
  await expect(page.locator(".report-chain")).toContainText(
    "German manufacturers",
  );
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await nav("World");
  await page.waitForTimeout(1400);
  await page
    .getByRole("button", { name: "Explore London", exact: true })
    .click();
  await expect(page.locator(".city-title h1")).toHaveText("London", {
    timeout: 15000,
  });
  await page.waitForTimeout(1600);
  await shot("london-light");
  await page.getByRole("button", { name: "South Bank", exact: true }).click();
  await page.waitForTimeout(2000);
  await shot("london-southbank");
  await theme("Mid");
  await shot("london-mid");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "mid");
  await theme("Light");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(1800);
  await shot("desktop");
  expect(errors).toEqual([]);
  console.log(
    "PASS: city identity, district focus, street zoom, 3 themes, persistence, newsroom search, chained dispatch and market implications. Browser errors:",
    errors,
  );
} catch (e) {
  await shot("failure");
  throw e;
} finally {
  await browser.close();
}
