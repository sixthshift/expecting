// Something has happened: from the guide's own page, Expecting goes quiet
// for both of you. This week becomes support, the timeline pauses, the
// Planner puts its list aside. Hard news can become a loss, and a loss
// set by mistake brings everything back, as this spec leaves it for the next.
import { expect, test } from "./fixtures";

test.describe.configure({ mode: "serial" });

test("hard news quiets every pillar, and becomes a loss", async ({ page, open }) => {
  await open("/library/something-has-happened");
  await page.getByRole("button", { name: "Something has happened" }).click();
  await page.getByRole("radio", { name: /We've had hard news/ }).check();
  await page.getByRole("button", { name: "Make Expecting quiet" }).click();
  await expect(page.getByText(/Expecting has been quiet since/)).toBeVisible();

  await open("/");
  await expect(page.getByRole("heading", { level: 1, name: "Take the time you need" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Someone to talk to" })).toBeVisible();
  // A loss's parts are a loss's alone.
  await expect(page.getByRole("heading", { name: "Your body" })).toBeHidden();

  await open("/timeline");
  await expect(page.getByText(/The timeline is paused/)).toBeVisible();
  await expect(page.locator("[data-week]")).toHaveCount(0);

  await open("/planner");
  await expect(page.getByText("Nothing needs doing. The to-do list is put aside, not deleted.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Next up" })).toBeHidden();

  await open("/settings?ask=quiet");
  await page.getByRole("button", { name: "We've lost the baby" }).click();
  await expect(page.getByRole("button", { name: "This was set by mistake" })).toBeVisible();
  // A loss never goes back to hard news.
  await expect(page.getByRole("button", { name: "Bring the weeks back" })).toBeHidden();

  await open("/");
  await expect(page.getByRole("heading", { name: "How you might feel" })).toBeVisible();

  // The "+" never offers a movement, and nothing to do.
  await page.getByRole("button", { name: "Add", exact: true }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("button", { name: "A note" })).toBeVisible();
  await expect(sheet.getByRole("button", { name: "The baby moved" })).toBeHidden();
  await expect(sheet.getByRole("button", { name: "Something to do" })).toBeHidden();
  await expect(sheet.getByRole("button", { name: "Sick or queasy" })).toBeHidden();
  await expect(sheet.getByRole("button", { name: "A craving" })).toBeHidden();
  await expect(sheet.getByRole("button", { name: "A photo or scan" })).toBeHidden();
  await sheet.getByRole("button", { name: "Close" }).click();
  await expect(sheet).toBeHidden();

  // The movements kept (plus.spec.ts kept some) are folded away, not shown on every visit.
  await open("/journal");
  await expect(page.getByRole("region", { name: "Movements" })).toBeHidden();
  await page.getByRole("button", { name: "The movements you kept" }).click();
  await expect(page.getByRole("region", { name: "Movements" }).getByRole("figure")).toBeVisible();
  // As are the sickness and cravings (plus-sickness.spec.ts kept some), with nothing new offered.
  await expect(page.getByRole("region", { name: "Sickness and cravings" })).toBeHidden();
  await page.getByRole("button", { name: "The sickness and cravings you kept" }).click();
  await expect(page.getByRole("region", { name: "Sickness and cravings" }).getByText("Craving: Pickles").first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Sickness and cravings" }).getByRole("button", { name: "Keep it" })).toBeHidden();
  // And the photos and scans (photos.spec.ts kept a bump): opened, plain, no bump week by week and no frame for this week.
  await expect(page.getByRole("region", { name: "Photos and scans" })).toBeHidden();
  await page.getByRole("button", { name: "The photos and scans you kept" }).click();
  const kept = page.getByRole("region", { name: "Photos and scans" });
  await expect(kept.getByRole("img", { name: /^Bump photo, week 28/ })).toBeVisible();
  await expect(kept.getByRole("region", { name: "Your bump, week by week" })).toBeHidden();

  // The Drawer is put away; Emergency info stops counting the weeks.
  await open("/drawer");
  await expect(page.getByText(/put away while Expecting is quiet/)).toBeVisible();
  await expect(page.getByText("Bump booth")).toBeHidden();
  await open("/emergency");
  await expect(page.getByText(/^Pregnancy loss/)).toBeVisible();
});

test("a loss set by mistake brings Expecting back as it was", async ({ page, open }) => {
  await open("/settings?ask=quiet");
  await page.getByRole("button", { name: "This was set by mistake" }).click();
  await page.getByRole("button", { name: "Yes, bring them back" }).click();
  await expect(page.getByRole("button", { name: "Something has happened" })).toBeVisible();

  await open("/timeline");
  await expect(page.locator("[data-week]").first()).toBeVisible();
});
