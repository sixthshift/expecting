// Notes in the Journal: kept on their day, by whoever's holding the phone,
// changed by either of you, and put back when deleted by mistake. Each shows
// on its week on the timeline.
import { expect, test } from "./fixtures";

test("a note is kept, changed, deleted and put back, and shows on its week", async ({ page, open }) => {
  await open("/journal");
  await page.getByRole("list", { name: "Keep" }).getByRole("button", { name: "Note" }).click();
  await page.getByRole("dialog").getByRole("textbox", { name: "New note" }).fill("Felt the first flutter on the bus");
  await page.getByRole("dialog").getByRole("button", { name: "Keep it" }).click();
  // On this week's page, on its day, written like a diary: no buttons on the line.
  const week = page.getByRole("region", { name: "This week" });
  await expect(week.getByText("Felt the first flutter on the bus")).toBeVisible();
  await expect(week.getByRole("button", { name: "Change this note" })).toBeHidden();

  // Opened, it's changed or deleted in a sheet.
  await week.getByRole("button", { name: "Open: Felt the first flutter on the bus" }).click();
  const sheet = page.getByRole("dialog", { name: "A note" });
  await expect(sheet.getByText(/^You · Today, /)).toBeVisible();
  await sheet.getByRole("button", { name: "Change this note" }).click();
  await sheet.getByRole("textbox", { name: "Note", exact: true }).fill("Felt the first flutter on the tram");
  await sheet.getByRole("button", { name: "Save", exact: true }).click();
  await expect(sheet.getByText(/· changed$/)).toBeVisible();
  await sheet.getByRole("button", { name: "Close" }).click();
  await expect(week.getByText("Felt the first flutter on the tram")).toBeVisible();

  await week.getByRole("button", { name: "Open: Felt the first flutter on the tram" }).click();
  await page.getByRole("dialog", { name: "A note" }).getByRole("button", { name: "Delete this note" }).click();
  await expect(page.getByRole("dialog", { name: "A note" })).toBeHidden();
  await expect(week.getByText("Felt the first flutter on the tram")).toBeHidden();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(week.getByText("Felt the first flutter on the tram")).toBeVisible();

  await open("/timeline");
  await expect(page.locator("[data-week]").filter({ hasText: /\d+ notes?/ })).toHaveCount(1);
});
