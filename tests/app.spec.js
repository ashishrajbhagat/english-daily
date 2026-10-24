const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

const nav = (page, name) => page.locator(".tabs button:visible, .side .nv:visible").filter({ hasText: name }).first();

async function start(page) {
  await page.goto("/");
  const beginner = page.getByRole("button", { name: /Beginner/ }).first();
  if (await beginner.isVisible({ timeout: 4000 }).catch(() => false)) await beginner.click();
  await expect(page.locator("main")).toBeVisible();
}

test("the page never scrolls sideways on any tab", async ({ page }) => {
  await start(page);
  for (const tab of ["Roadmap", "Speak", "Learn", "Grammar", "Quiz", "Home"]) {
    await nav(page, tab).click();
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over, "horizontal overflow on " + tab).toBeLessThanOrEqual(1);
  }
});

test("header stays on one line and shows the profile icon", async ({ page }) => {
  await start(page);
  const prof = page.getByRole("button", { name: "Account and settings" });
  await expect(prof).toBeVisible();
  const box = await prof.boundingBox();
  expect(box.height).toBeLessThan(60);
});

test("a guest can start Quick Start and tick a task", async ({ page }) => {
  await start(page);
  await nav(page, "Roadmap").click();
  await page.getByRole("button", { name: /Start this roadmap/ }).first().click();
  const skip = page.getByRole("button", { name: "Skip for now" });
  if (await skip.isVisible({ timeout: 1500 }).catch(() => false)) await skip.click();
  await expect(page.getByText(/Day 1 of 15/).first()).toBeVisible();
  const done = page.getByRole("button", { name: "Mark as done" }).first();
  await done.click();
  await expect(done).toHaveText("✓");
});

test("profile sheet opens, Escape closes it, and Hindi mode translates the menu", async ({ page }) => {
  await start(page);
  await page.getByRole("button", { name: "Account and settings" }).click();
  await expect(page.locator(".sheet")).toBeVisible();
  await page.locator(".tabs2 button").filter({ hasText: "Settings" }).click();
  await page.getByRole("button", { name: "हिन्दी" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".sheet")).toHaveCount(0);
  await expect(nav(page, "होम")).toBeVisible();
});

test("Speak, Learn and Grammar show content for the chosen level", async ({ page }) => {
  await start(page);
  await nav(page, "Speak").click();
  await expect(page.locator(".card").first()).toBeVisible();
  await nav(page, "Grammar").click();
  await expect(page.getByText(/lessons/).first()).toBeVisible();
  await nav(page, "Learn").click();
  await expect(page.locator(".flash")).toBeVisible();
});

test("privacy page and 404 page work", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  await page.goto("/this-page-does-not-exist");
  await expect(page.getByText("Page not found")).toBeVisible();
});

test("no serious accessibility violations on Home", async ({ page }) => {
  await start(page);
  const r = await new AxeBuilder({ page }).analyze();
  const bad = r.violations.filter((v) => ["serious", "critical"].includes(v.impact));
  expect(bad.map((v) => v.id + ": " + v.help)).toEqual([]);
});
