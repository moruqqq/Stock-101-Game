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
const cities = [
  "Istanbul",
  "London",
  "Paris",
  "Tokyo",
  "New York",
  "Nairobi",
  "Frankfurt",
  "Hong Kong",
  "Shanghai",
  "Singapore",
  "Dubai",
  "Sydney",
  "Toronto",
  "Mumbai",
  "São Paulo",
];
try {
  await page.goto(process.env.BASE_URL ?? "http://localhost:4173");
  await page.waitForSelector("canvas");
  for (const name of cities) {
    await page
      .getByRole("button", { name: "Explore all 15 cities", exact: true })
      .click();
    await expect(page.locator(".city-directory>button")).toHaveCount(15);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Visit " + name, exact: true })
      .click();
    await expect(page.locator(".city-title h1")).toHaveText(name, {
      timeout: 15000,
    });
    await page.waitForTimeout(850);
    await expect(page.locator(".city-canvas canvas")).toBeVisible();
    await expect(page.locator(".city-pin").first()).toBeVisible();
    if (["Tokyo", "New York", "Singapore", "Dubai", "Sydney"].includes(name))
      await page.screenshot({
        path: "artifacts/city-tour-" + name.replaceAll(" ", "-") + ".png",
      });
    if (name === "Istanbul") {
      await page.getByRole("button", { name: /\d+ local reports/ }).click();
      await expect(page.locator(".city-dispatch-row")).toHaveCount(7);
      await page
        .locator(".city-dispatch-row")
        .first()
        .getByRole("button")
        .first()
        .click();
      await expect(page.getByRole("dialog")).toContainText("feline board");
      await page
        .getByRole("button", { name: "Close dialog", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Galata & Karaköy", exact: true })
        .click();
      await expect(page.locator(".expanded-city")).toHaveAttribute(
        "data-level",
        "street",
        { timeout: 12000 },
      );
      await page
        .getByRole("button", { name: "City overview", exact: true })
        .click();
      await expect(page.locator(".expanded-city")).toHaveAttribute(
        "data-level",
        "city",
        { timeout: 12000 },
      );
    }
    console.log("PASS city:", name);
    await page.locator(".planet-back").click();
    await expect(page.locator(".world-page")).toBeVisible();
    await page.waitForTimeout(300);
  }
  expect(errors).toEqual([]);
  console.log(
    "PASS: all 15 cities, directory, local dispatch list, overview reset; no browser errors.",
  );
} catch (e) {
  await page.screenshot({ path: "artifacts/city-tour-failure.png" });
  throw e;
} finally {
  await browser.close();
}
