// Notes in the Journal: kept on their day, by whoever's holding the phone,
// changed by either of you, and put back when deleted by mistake. Each shows
// on its week on the timeline.
import { expect, test } from "./fixtures";

test("a note is kept, changed, deleted and put back, and shows on its week", async ({ page, open }) => {
  await open("/journal");
  await page.getByRole("textbox", { name: "New note" }).fill("Felt the first flutter on the bus");
  await page.getByRole("button", { name: "Keep it" }).click();
  const note = page.getByText("Felt the first flutter on the bus");
  await expect(note).toBeVisible();
  await expect(page.getByText(/^You · Today, /)).toBeVisible();

  await page.getByRole("button", { name: "Change this note" }).first().click();
  await page.getByRole("textbox", { name: "Note", exact: true }).fill("Felt the first flutter on the tram");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Felt the first flutter on the tram")).toBeVisible();
  await expect(page.getByText(/· changed$/)).toBeVisible();

  await page.getByRole("button", { name: "Delete this note" }).first().click();
  await expect(page.getByText("Felt the first flutter on the tram")).toBeHidden();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Felt the first flutter on the tram")).toBeVisible();

  await open("/timeline");
  await expect(page.locator("[data-week]").filter({ hasText: /\d+ notes?/ })).toHaveCount(1);
});
