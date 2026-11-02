// The capture "+": one way in from every pillar, filing each thing into its
// own. Kept in the sheet, it says where it went and leaves you where you
// were. A movement felt as slower, weaker or stopped keeps the call on
// screen. Runs after the journey, as specs run by name: at week 28.
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/** Open the sheet and pick `choice`. */
async function add(page: Page, choice: string) {
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: choice }).click();
}

test("a movement is kept from any pillar, lands in the Journal, and marks its week", async ({ page, open }) => {
  await open("/planner");
  await add(page, "The baby moved");
  await page.getByRole("textbox", { name: "About the movement" }).fill("Hiccups after dinner");
  await page.getByRole("button", { name: "Keep it" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText("In the Journal")).toBeVisible();
  await expect(page).toHaveURL(/\/planner$/);

  // "See it" opens the Journal, with it on this week's page, and in its lens on the fortnight's pattern.
  await page.getByRole("button", { name: "See it" }).click();
  await expect(page).toHaveURL(/\/journal$/);
  await expect(page.getByRole("region", { name: "This week" }).getByText("Hiccups after dinner")).toBeVisible();
  await open("/journal/collections/movements");
  await expect(page.getByRole("region", { name: "Movements" }).getByRole("figure")).toBeVisible();
  await expect(page.getByRole("region", { name: "Movements" }).getByText("Hiccups after dinner")).toBeVisible();

  await open("/timeline");
  await expect(page.locator("[data-week]").filter({ hasText: "felt moving" })).toHaveCount(1);
});

test("a movement felt as slower, weaker or stopped keeps the call on screen until put away", async ({ page, open }) => {
  await open("/");
  await add(page, "The baby moved");
  await page.getByRole("checkbox", { name: "Slower, weaker or stopped?" }).click();
  await page.getByRole("button", { name: "Keep it" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("alert")).toContainText("Call your midwife or birth unit now.");
  await expect(dialog.getByRole("link", { name: "Every number, in Emergency info" })).toBeVisible();
  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(dialog).toBeHidden();

  // On the Journal the call stays first for today and tomorrow.
  await open("/journal");
  await expect(page.getByRole("alert").filter({ hasText: "Call your midwife or birth unit now." })).toBeVisible();
  await open("/journal/collections/movements");
  await expect(page.getByRole("region", { name: "Movements" }).getByText("· slower, weaker or stopped")).toBeVisible();
});

test("a note, a feeling, a question and a task each go to their pillar", async ({ page, open }) => {
  await open("/library");
  await add(page, "A note");
  await page.getByRole("textbox", { name: "New note" }).fill("Bought the cot");
  await page.getByRole("button", { name: "Keep it" }).click();
  await expect(page.getByText("In the Journal")).toBeVisible();

  await add(page, "How I'm feeling");
  await page.getByRole("dialog").getByText("Good", { exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await add(page, "A question to ask");
  await page.getByRole("dialog").getByRole("textbox").fill("Do we need a car seat fitted?");
  await page.getByRole("dialog").getByRole("button", { name: "Add question" }).click();
  await expect(page.getByText("In the Planner")).toBeVisible();

  await add(page, "Something to do");
  await page.getByRole("textbox", { name: /New task/ }).fill("Pack the hospital bag");
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page).toHaveURL(/\/library$/);

  await open("/journal");
  await expect(page.getByRole("region", { name: "This week" }).getByText("Bought the cot")).toBeVisible();
  await open("/planner");
  await expect(page.getByText("Do we need a car seat fitted?")).toBeVisible();
  await expect(page.getByText("Pack the hospital bag")).toBeVisible();
});

test("the + is on the pillars, not on settings or Emergency info", async ({ page, open }) => {
  const plus = page.getByRole("button", { name: "Add", exact: true });
  await open("/drawer");
  await expect(plus).toBeVisible();
  await open("/settings");
  await expect(plus).toBeHidden();
  await open("/emergency");
  await expect(plus).toBeHidden();
});
