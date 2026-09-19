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
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
  locale: "en-US",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto(process.env.BASE_URL ?? "http://localhost:4173");
  await page.waitForSelector("canvas");
  await page.getByRole("button", { name: "Türkçe", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(
    page.getByRole("button", { name: "Haberler", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Tek bir dünya",
  );
  await page.screenshot({ path: "artifacts/locale-world-tr.png" });
  await page
    .getByRole("button", { name: "15 şehri keşfet", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "İstanbul şehrini ziyaret et", exact: true })
    .click();
  await expect(page.locator(".city-title h1")).toHaveText("İstanbul");
  await page
    .getByRole("button", { name: "Öne çıkan haberi şehirde bul", exact: true })
    .click();
  await expect(page.locator(".expanded-city")).toHaveAttribute(
    "data-focused-event",
    "cats",
  );
  await page.waitForTimeout(1600);
  const canvas = await page.locator(".city-canvas canvas").elementHandle();
  await page.screenshot({ path: "artifacts/locale-city-tr.png" });
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator(".city-title h1")).toHaveText("Istanbul");
  expect(await canvas.evaluate((el) => el.isConnected)).toBe(true);
  await expect(page.locator(".expanded-city")).toHaveAttribute(
    "data-focused-event",
    "cats",
  );
  await page.getByRole("button", { name: "Read report", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Türkçe", exact: true })
    .click();
  await expect(page.locator(".story-article h1")).toContainText("kedi yönetim");
  await expect(page.locator(".news-reel")).toHaveAttribute(
    "data-scene",
    "cats",
  );
  await page.screenshot({ path: "artifacts/locale-story-tr.png" });
  await page
    .getByRole("button", { name: "Pencereyi kapat", exact: true })
    .click();
  await page.getByRole("button", { name: "Haberler", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Haber ara", exact: true })
    .fill("kahve");
  await expect(page.locator(".feature-news h2")).toContainText("kahve");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Search news", exact: true }),
  ).toHaveValue("kahve");
  await expect(page.locator(".feature-news h2")).toContainText("coffee");
  await page.getByRole("button", { name: "Türkçe", exact: true }).click();
  await page.getByRole("button", { name: "Piyasalar", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Piyasa ve şirket ara", exact: true })
    .fill("londra");
  await expect(page.locator(".exchange-card")).toHaveCount(1);
  await expect(page.locator(".exchange-card")).toContainText("Londra");
  await page.getByRole("button", { name: "Portföy", exact: true }).click();
  await expect(page.locator(".portfolio-overview h2")).toContainText(
    /\$[\d.]+,\d{2}/,
  );
  await page.screenshot({ path: "artifacts/locale-portfolio-tr.png" });
  const holdings = await page.locator(".stock-identity b").allTextContents();
  await page.getByRole("button", { name: "English", exact: true }).click();
  expect(await page.locator(".stock-identity b").allTextContents()).toEqual(
    holdings,
  );
  await page.getByRole("button", { name: "Türkçe", exact: true }).click();
  await page
    .getByRole("button", { name: "Simülasyon kontrollerini aç", exact: true })
    .click();
  await page.getByRole("button", { name: "14:30", exact: true }).click();
  await page
    .getByRole("button", { name: "Pencereyi kapat", exact: true })
    .click();
  await page.locator(".stock-row").filter({ hasText: "THRA" }).click();
  await page.getByRole("button", { name: "Al THRA", exact: true }).click();
  await page.getByRole("dialog").getByRole("spinbutton").fill("37");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "English", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("spinbutton")).toHaveValue(
    "37",
  );
  await expect(page.getByRole("dialog")).toContainText("Buy THRA");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Türkçe", exact: true })
    .click();
  await page.getByRole("button", { name: "AL 37 THRA", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Emir gerçekleşti");
  await page.screenshot({ path: "artifacts/locale-order-tr.png" });
  await page
    .getByRole("button", { name: "Keşfe devam et", exact: true })
    .click();
  await page.getByRole("button", { name: "Portföy", exact: true }).click();
  await expect(
    page.locator(".stock-row").filter({ hasText: "THRA" }),
  ).toContainText("137 hisse");
  console.log(
    "PASS: order quantity survives language changes; Turkish buy updates holdings.",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(
    page.getByRole("button", { name: "Türkçe", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 360, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "artifacts/locale-small-tr.png" });
  expect(errors).toEqual([]);
  console.log(
    "PASS: TR/EN UI, cities, exact report, persistent language, bilingual search, number formats, preserved canvas/holdings, mobile bounds.",
  );
} catch (e) {
  await page.screenshot({ path: "artifacts/locale-failure.png" });
  throw e;
} finally {
  await browser.close();
}
