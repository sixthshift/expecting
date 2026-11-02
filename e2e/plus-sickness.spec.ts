// Sickness and cravings, from the "+": kept in a tap or two, from any
// pillar, by whoever is holding the phone. Can't keep fluids down keeps the
// call on screen; a craving kept again is one tap; one for something that
// isn't food says so quietly, with a question for the appointment. The
// Journal answers "since when?" and tallies the cravings, and the timeline
// marks the week. Runs after the journey (at week 28) and before quiet.spec.ts,
// which checks they're folded away after a loss, as specs run by name.
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/** Open the sheet and pick `choice`. */
async function add(page: Page, choice: string) {
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: choice }).click();
}

test("sickness is kept in a tap, and the Journal says since when", async ({ page, open }) => {
  await open("/planner");
  await add(page, "Sick or queasy");
  const sheet = page.getByRole("dialog");
  await sheet.getByText("Threw up", { exact: true }).click();
  await expect(sheet.getByText("Kept. Anything else, if you want.")).toBeVisible();
  await sheet.getByRole("textbox", { name: "About it" }).fill("After breakfast");
  await sheet.getByRole("button", { name: "Done" }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByText("In the Journal")).toBeVisible();
  await expect(page).toHaveURL(/\/planner$/);

  await open("/journal/records?show=appetite");
  const section = page.getByRole("region", { name: "Sickness and cravings" });
  await expect(section.getByText(/^Since /).first()).toBeVisible();
  await expect(section.getByText(/threw up\.$/)).toBeVisible();
  await expect(section.getByRole("figure")).toBeVisible();
  await expect(section.getByText("After breakfast")).toBeVisible();
});

test("can't keep fluids down keeps the call on screen", async ({ page, open }) => {
  await open("/");
  await add(page, "Sick or queasy");
  const sheet = page.getByRole("dialog");
  await sheet.getByText("Can't keep fluids down", { exact: true }).click();
  await expect(sheet.getByRole("alert")).toContainText("Call your doctor, midwife or hospital now.");
  await expect(sheet.getByRole("link", { name: "Every number, in Emergency info" })).toBeVisible();
  await sheet.getByRole("button", { name: "Done" }).click();
  await expect(sheet).toBeHidden();
});

test("a craving, then the same again in one tap, tallied in the Journal and marked on the timeline", async ({ page, open }) => {
  await open("/library");
  await add(page, "A craving");
  await page.getByRole("textbox", { name: "What are you craving?" }).fill("Pickles");
  await page.getByRole("button", { name: "Keep it" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await add(page, "A craving");
  await page.getByRole("dialog").getByRole("button", { name: "Keep Pickles again" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await open("/journal/records?show=appetite");
  const section = page.getByRole("region", { name: "Sickness and cravings" });
  await expect(section.getByRole("heading", { name: "What you've craved" })).toBeVisible();
  await expect(section.getByText("2 times · from week 28")).toBeVisible();

  await open("/timeline");
  const week = page.locator('[data-week="28"]');
  await expect(week).toContainText("craved pickles");
  await expect(week).toContainText(/sick 1 day/);
});

test("a craving for something that isn't food says so quietly, with a question to take along", async ({ page, open }) => {
  await open("/");
  await add(page, "A craving");
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("textbox", { name: "What are you craving?" }).fill("Ice");
  await sheet.getByRole("button", { name: "Keep it" }).click();
  await expect(sheet.getByText(/worth mentioning to your midwife or doctor/)).toBeVisible();
  await expect(sheet.getByRole("alert")).toBeHidden();
  await sheet.getByRole("button", { name: /^Add to your questions/ }).click();
  await expect(sheet.getByText("On your list")).toBeVisible();
  await sheet.getByRole("button", { name: "Done" }).click();
  await expect(sheet).toBeHidden();

  await open("/planner");
  await expect(page.getByText("I've been craving ice. Should my iron be checked?")).toBeVisible();
});
