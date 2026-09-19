import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
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
  await page.goto(process.env.BASE_URL ?? "http://localhost:4173");
  await page.waitForSelector("canvas");
  await page
    .getByRole("button", { name: "Explore all 15 cities", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Visit Istanbul", exact: true })
    .click();
  await expect(page.locator(".city-title h1")).toHaveText("Istanbul", {
    timeout: 15000,
  });
  await page
    .getByRole("button", { name: "Locate lead report", exact: true })
    .click();
  await expect(page.locator(".expanded-city")).toHaveAttribute(
    "data-focused-event",
    "cats",
  );
  await page.waitForTimeout(2300);
  await page.screenshot({ path: "artifacts/live-cats-light.png" });
  await page.getByRole("button", { name: "Read report", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("feline board");
  await expect(page.locator(".news-reel")).toHaveAttribute(
    "data-scene",
    "cats",
  );
  await page
    .getByRole("button", { name: "Explore Istanbul", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".expanded-city")).toHaveAttribute(
    "data-focused-event",
    "cats",
  );
  console.log("PASS city -> same report -> same location");
  for (const theme of ["Mid", "Dark", "Light"]) {
    await page
      .getByRole("button", { name: "Choose appearance", exact: true })
      .click();
    await page
      .getByRole("group", { name: "Appearance", exact: true })
      .getByRole("button", { name: theme, exact: true })
      .click();
    await page.waitForTimeout(450);
    await expect(page.locator(".expanded-city")).toHaveAttribute(
      "data-focused-event",
      "cats",
    );
    if (theme === "Dark")
      await page.screenshot({ path: "artifacts/live-cats-dark.png" });
  }
  await page
    .getByRole("button", { name: "Explore street life", exact: true })
    .click();
  await page.waitForTimeout(2300);
  await page.screenshot({ path: "artifacts/live-people.png" });
  // Zoom out with the same controls used by touch; do not press World.
  for (
    let i = 0;
    i < 6 && (await page.locator(".expanded-city").count());
    i++
  ) {
    await page
      .getByRole("button", { name: "Zoom out of city", exact: true })
      .click();
    await page.waitForTimeout(1250);
  }
  await expect(page.locator(".world-page")).toBeVisible({ timeout: 12000 });
  console.log("PASS zoom out returns to the globe");
  await page
    .getByRole("button", { name: "Explore all 15 cities", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Visit London", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Locate lead report", exact: true })
    .click();
  await expect(page.locator(".expanded-city")).toHaveAttribute(
    "data-focused-event",
    "balloons",
  );
  await page.waitForTimeout(2400);
  await page.screenshot({ path: "artifacts/live-london.png" });
  await page.getByRole("button", { name: /\d+ local reports/ }).click();
  await page
    .getByRole("button", { name: /Show on streets:/ })
    .nth(3)
    .click();
  await expect(page.locator(".expanded-city")).not.toHaveAttribute(
    "data-focused-event",
    "balloons",
  );
  console.log("PASS local report focuses its own animated location");
  expect(errors).toEqual([]);
  console.log("PASS no browser errors");
} catch (e) {
  await page.screenshot({ path: "artifacts/live-world-failure.png" });
  throw e;
} finally {
  await browser.close();
}
