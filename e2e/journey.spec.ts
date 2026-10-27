// The household's first evening with the app: a due date, a task of their
// own, a ticked task that stays ticked, and a question for the midwife.
// Runs first (file order) against the empty database the config makes.
import { expect, test } from "./fixtures";

/** dd, mm, yyyy of today plus `days`, in this machine's local time, as the app sees it. */
function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}${d.getFullYear()}`;
}

test.describe.configure({ mode: "serial" });

test("entering the due date opens at the current week", async ({ page, open }) => {
  await open("/");
  await expect(page.getByRole("heading", { level: 1, name: "Expecting" })).toBeVisible();

  // 12 weeks to go is 28+0.
  await page.getByRole("spinbutton", { name: /day/i }).click();
  await page.keyboard.type(daysFromToday(12 * 7));
  await page.getByRole("button", { name: "Start" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Week 28" })).toBeVisible();
  await expect(page.getByText("28+0 · 84 days to go")).toBeVisible();

  await page.getByRole("link", { name: /^Next: Week 29/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Week 29" })).toBeVisible();
  await page.getByRole("link", { name: "This week" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Week 28" })).toBeVisible();
});

test("an own task is added, shows on its week, and ticks everywhere", async ({ page, open }) => {
  await open("/checklist");
  await page.getByRole("textbox", { name: "New task" }).fill("Pack the snacks for the hospital");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  const task = page.getByRole("checkbox", { name: "Pack the snacks for the hospital" });
  await expect(task).toBeVisible();
  await task.click();
  // It stays in view, ticked, for the rest of this visit.
  await expect(task).toBeChecked();
  await expect(page.getByText(/^1 of \d+ done$/)).toBeVisible();

  // Next visit, ticked tasks are out of "To do" and under "Everything".
  await page.reload({ waitUntil: "networkidle" });
  await expect(task).toBeHidden();
  await page.getByRole("radio", { name: "Everything" }).click();
  await expect(task).toBeChecked();

  await page.getByRole("link", { name: "This week" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Week 28" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Pack the snacks for the hospital" })).toBeChecked();

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("checkbox", { name: "Pack the snacks for the hospital" })).toBeChecked();
});

test("a question is added, asked and answered", async ({ page, open }) => {
  await open("/questions");
  await page.getByRole("textbox", { name: "New question" }).fill("Which hospital entrance after hours?");
  await page.getByRole("button", { name: "Add question" }).click();
  await expect(page.getByText("Which hospital entrance after hours?")).toBeVisible();

  await page.getByRole("button", { name: "Asked it" }).click();
  await page.getByRole("textbox", { name: "Answer" }).fill("Emergency, then the lift to level 3.");
  await page.getByRole("button", { name: "Save as asked" }).click();

  await expect(page.getByRole("heading", { name: "Asked" })).toBeVisible();
  await expect(page.getByText("Emergency, then the lift to level 3.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Asked it" })).toBeHidden();
});
