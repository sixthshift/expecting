// The household's first evening with the timeline: a due date, moving along
// the ruler, a task of their own that stays ticked, a jump from a task to why
// it matters, and a question for the midwife. Runs first, on the phone, against
// the empty database the config makes.
import { expect, test } from "./fixtures";

/** dd, mm, yyyy of today plus `days`, in this machine's local time, as the app sees it. */
function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}${d.getFullYear()}`;
}

test.describe.configure({ mode: "serial" });

const week = (page: import("@playwright/test").Page, key: string) => page.locator(`[data-week="${key}"]`);

test("entering the due date opens the timeline at this week", async ({ page, open }) => {
  await open("/");
  await page.getByRole("spinbutton", { name: /day/i }).click();
  // 12 weeks to go is 28+0.
  await page.keyboard.type(daysFromToday(12 * 7));
  await page.getByRole("button", { name: "Start", exact: true }).click();

  await expect(week(page, "28").getByRole("heading", { name: "28 weeks" })).toBeVisible();
  await expect(page.getByText("28+0 · 84 days to go")).toBeVisible();
  await expect(page.getByRole("slider", { name: "Timeline" })).toHaveAttribute("aria-valuetext", "Week 28");
});

test("the ruler moves along the timeline, and Today comes back", async ({ page, open }) => {
  await open("/");
  const ruler = page.getByRole("slider", { name: "Timeline" });
  await ruler.focus();
  await page.keyboard.press("PageDown");
  await expect(ruler).toHaveAttribute("aria-valuetext", "Week 32");
  await expect(week(page, "32")).toBeInViewport();
  // A settled move opens the week it lands on.
  await expect(week(page, "32").getByRole("textbox", { name: "New task for Week 32" })).toBeVisible();

  await page.keyboard.press("End");
  await expect(ruler).toHaveAttribute("aria-valuetext", "Week 12 after birth");
  await expect(week(page, "pp12")).toBeInViewport();

  await page.getByRole("button", { name: "Today" }).click();
  await expect(week(page, "28")).toBeInViewport();
});

test("an own task is added to its week and stays ticked across views", async ({ page, open }) => {
  await open("/");
  await week(page, "28").getByRole("textbox", { name: "New task for Week 28" }).fill("Pack the snacks for the hospital");
  await week(page, "28").getByRole("button", { name: "Add task" }).click();

  const task = page.getByRole("checkbox", { name: "Pack the snacks for the hospital" });
  await task.click();
  await expect(task).toBeChecked();

  // Ticked this visit, it stays in To do until the next one.
  await page.getByRole("navigation", { name: "Views" }).getByRole("link", { name: "To do" }).click();
  await expect(task).toBeChecked();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("checkbox", { name: "Pack the snacks for the hospital" })).toBeHidden();

  await page.getByRole("navigation", { name: "Views" }).getByRole("link", { name: "Everything" }).click();
  await expect(page.getByRole("checkbox", { name: "Pack the snacks for the hospital" })).toBeChecked();
});

test("Why jumps from a task to the item that explains it", async ({ page, open }) => {
  await open("/?view=todo");
  await page.getByRole("button", { name: "Why: Book the RSV vaccine" }).click();
  await expect(page.locator("#item-rsv-vaccine")).toBeInViewport();
  await expect(page.getByRole("navigation", { name: "Views" }).getByRole("link", { name: "Everything" })).toHaveAttribute("aria-current", "page");
});

test("a question is added, asked, and lands in this week", async ({ page, open }) => {
  await open("/?view=questions");
  await page.getByRole("textbox", { name: "New question" }).fill("Which hospital entrance after hours?");
  await page.getByRole("button", { name: "Add question" }).click();
  await expect(page.getByText("Which hospital entrance after hours?")).toBeVisible();

  await page.getByRole("button", { name: "Asked it" }).click();
  await page.getByRole("textbox", { name: "Answer" }).fill("Emergency, then the lift to level 3.");
  await page.getByRole("button", { name: "Save as asked" }).click();

  await expect(week(page, "28").getByText("Emergency, then the lift to level 3.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Asked it" })).toBeHidden();
});

test("the answer to boy or girl sets the colours, and they survive a reload", async ({ page, open }) => {
  const theme = () => page.evaluate(() => document.documentElement.dataset.expectingTheme ?? "dawn");
  await open("/settings");
  expect(await theme()).toBe("dawn");

  await page.getByRole("radio", { name: "Girl" }).click();
  await expect.poll(theme).toBe("blossom");
  await page.reload({ waitUntil: "networkidle" });
  expect(await theme()).toBe("blossom");

  await page.getByRole("radio", { name: "Boy" }).click();
  await expect.poll(theme).toBe("sky");
  await page.getByRole("link", { name: "Timeline" }).click();
  await expect(page.getByRole("slider", { name: "Timeline" })).toBeVisible();
  expect(await theme()).toBe("sky");

  await open("/settings");
  await page.getByRole("radio", { name: "Don't know / surprise" }).click();
  await expect.poll(theme).toBe("dawn");
});
