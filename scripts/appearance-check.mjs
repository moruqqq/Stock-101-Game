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
const choose = async (name) => {
  await button("Choose appearance").click();
  await page
    .getByRole("group", { name: "Appearance", exact: true })
    .getByRole("button", { name, exact: true })
    .click();
};
const shot = (name) =>
  page.screenshot({ path: `artifacts/appearance-${name}.png` });
try {
  await page.goto(process.env.BASE_URL ?? "http://localhost:4173");
  await page.waitForSelector("canvas");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await expect(page.locator("html")).toHaveAttribute(
    "data-ui-style",
    "balanced",
  );
  const heading = page.locator(".world-top h1");
  expect(
    await heading.evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("DM Sans");
  await shot("balanced-world");
  await choose("Playful");
  expect(
    await heading.evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("Fredoka");
  await shot("playful-world");
  await choose("Balanced");
  await button("Choose appearance").click();
  await shot("menu");
  await page.keyboard.press("Escape");
  await button("Visit Istanbul").click();
  await button("Locate lead report").click();
  await expect(page.locator(".expanded-city")).toHaveAttribute(
    "data-focused-event",
    "cats",
  );
  const canvas = await page.locator(".city-canvas canvas").elementHandle();
  for (const style of ["Playful", "Balanced"]) {
    await choose(style);
    for (const theme of ["Light", "Mid", "Dark"]) {
      await choose(theme);
      await expect(page.locator("html")).toHaveAttribute(
        "data-ui-style",
        style.toLowerCase(),
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-theme",
        theme.toLowerCase(),
      );
      await expect(page.locator(".expanded-city")).toHaveAttribute(
        "data-focused-event",
        "cats",
      );
      expect(await canvas.evaluate((el) => el.isConnected)).toBe(true);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(390);
    }
  }
  await shot("balanced-city-dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-ui-style",
    "balanced",
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await choose("Light");
  await button("Türkçe").click();
  await button("Görünümü seç").click();
  await expect(button("Dengeli")).toHaveAttribute("aria-pressed", "true");
  await shot("menu-tr");
  await page.keyboard.press("Escape");
  await button("Haberler").click();
  await page.waitForTimeout(700);
  await shot("balanced-news-tr");
  await page.locator(".news-headline-button").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .locator(".sheet-header h2")
      .evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("DM Sans");
  await shot("balanced-report-tr");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Pencereyi kapat", exact: true })
    .click();
  for (const [tab, filename] of [
    ["Piyasalar", "markets"],
    ["Portföy", "portfolio"],
    ["Dünya", "world-tr"],
  ]) {
    await button(tab).click();
    await page.waitForTimeout(400);
    await shot("balanced-" + filename);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(390);
  }
  await page.setViewportSize({ width: 360, height: 740 });
  await shot("balanced-small");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    360,
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(700);
  await shot("balanced-desktop");
  expect(errors).toEqual([]);
  console.log(
    "PASS: both interface styles, all three colour themes, persistence, TR/EN labels, unchanged city canvas and event focus, all main screens and mobile bounds.",
  );
} catch (error) {
  await shot("failure");
  throw error;
} finally {
  await browser.close();
}
