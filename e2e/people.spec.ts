// Your people, the Drawer's: one list, a view of it for each extra that
// brings one. Visitors and Thank-you notes turned on, someone added, welcome
// in hospital, and a gift from them thanked, all still there after a reload.
import { expect, test } from "./fixtures";

test("your people: someone added, welcome in hospital, and their gift thanked, kept across a reload", async ({ page, open }) => {
  // Off until an extra that brings it is on: the Drawer says which.
  await open("/drawer");
  await expect(page.getByText(/It comes with Visitors, Birth announcement, Lining up help or Thank-you notes/)).toBeVisible();
  await open("/settings");
  for (const name of ["Visitors", "Thank-you notes"]) {
    const toggle = page.getByRole("switch", { name });
    await expect(toggle).toBeVisible();
    if (!(await toggle.isChecked())) await toggle.click();
    await expect(toggle).toBeChecked();
  }
  await expect(page.getByText("And the visitors list, in the Drawer")).toBeVisible();

  await open("/drawer");
  await page.getByRole("link", { name: /^Your people/ }).click();
  await expect(page).toHaveURL(/\/drawer\/people$/);
  await expect(page.getByRole("heading", { level: 1, name: "Your people" })).toBeVisible();

  const name = `Mum ${Date.now()}`;
  await page.getByRole("textbox", { name: "Someone to add" }).fill(name);
  await page.getByRole("button", { name: "Add them" }).click();
  await expect(page.getByRole("region", { name: "Not decided" }).getByText(name)).toBeVisible();

  await page.getByRole("button", { name: `Change: ${name}` }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("radio", { name: "In hospital" }).click();
  await sheet.getByRole("button", { name: "Save" }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByRole("region", { name: "In hospital" }).getByText(name)).toBeVisible();

  // The gifts: one from them, still to thank for, then thanked.
  await page.getByRole("radio", { name: "Gifts" }).click();
  await expect(page).toHaveURL(/view=gifts/);
  await page.getByRole("textbox", { name: "The gift" }).fill("The pram");
  await page.getByRole("combobox", { name: "From" }).click();
  await page.getByRole("option", { name }).click();
  await page.getByRole("button", { name: "Add the gift" }).click();
  const pram = page.getByRole("region", { name }).getByRole("checkbox", { name: "The pram" });
  await expect(pram).not.toBeChecked();
  await expect(page.getByRole("radio", { name: /Gifts · \d+ to thank/ })).toBeVisible();
  await pram.click();
  await expect(page.getByRole("region", { name }).getByRole("checkbox", { name: /The pram · thanked/ })).toBeChecked();

  await page.reload();
  await expect(page.getByRole("region", { name }).getByRole("checkbox", { name: /The pram · thanked/ })).toBeChecked();
  await page.getByRole("radio", { name: "Visitors" }).click();
  await expect(page.getByRole("region", { name: "In hospital" }).getByText(name)).toBeVisible();
});
