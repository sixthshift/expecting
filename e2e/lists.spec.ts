// The lists, the Planner's: what to get, a list per job. A built-in line is
// ticked and opened to say it's arranged, a list of your own is made, filled
// and deleted, and every mark is still there after a reload, on both lists.
import { expect, test } from "./fixtures";

test("Before the birth: a line ticked got, another arranged with a few words, kept across a reload", async ({ page, open }) => {
  await open("/planner");
  const wayIn = page.getByRole("region", { name: "Lists" });
  await wayIn.getByRole("link", { name: /Before the birth/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Before the birth" })).toBeVisible();

  // Its sections, in order, and the car seat's task beside it.
  await expect(page.getByRole("region", { name: "Out and about" }).getByText(/^by week 36$/)).toBeVisible();

  const nappies = page.getByRole("checkbox", { name: "Nappies, disposable or cloth" });
  await nappies.click();
  await expect(nappies).toBeChecked();

  await page.getByRole("button", { name: "Change: Pram that meets the safety standard" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("radio", { name: "Arranged" }).click();
  await sheet.getByRole("textbox", { name: "A few words" }).fill("Mum's lending hers");
  await sheet.getByRole("button", { name: "Save" }).click();
  await expect(sheet).toBeHidden();
  const pram = page.getByRole("region", { name: "Out and about" });
  await expect(pram.getByText("Arranged", { exact: true })).toBeVisible();
  await expect(pram.getByText("“Mum's lending hers”")).toBeVisible();

  // For the shop: just what's left, the got hidden.
  await page.getByRole("switch", { name: "Just what's left" }).click();
  await expect(page.getByRole("checkbox", { name: "Nappies, disposable or cloth" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Nappies, disposable or cloth" })).toBeChecked();
  await page.getByRole("switch", { name: "Just what's left" }).click();
  await expect(page.getByRole("checkbox", { name: "Nappies, disposable or cloth" })).toBeHidden();
  await expect(pram.getByText("“Mum's lending hers”")).toBeVisible();
});

test("a list of your own: made, a line added and ticked, then deleted", async ({ page, open }) => {
  const name = `Bunnings run ${Date.now()}`;
  await open("/planner/lists");
  await page.getByRole("textbox", { name: "A new list's name" }).fill(name);
  await page.getByRole("button", { name: "New list" }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  await expect(page.getByText("Nothing on it yet")).toBeVisible();

  await page.getByRole("textbox", { name: "Something to add" }).fill("Wall hooks");
  await page.getByRole("button", { name: "Add it" }).click();
  await page.getByRole("checkbox", { name: "Wall hooks" }).click();
  await expect(page.getByText("1 of 1 got")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Wall hooks" })).toBeChecked();

  await page.getByRole("button", { name: "Delete list" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Lists" })).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(name) })).toBeHidden();
});
