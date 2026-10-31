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

  // The movements, sickness and cravings and photos kept (plus.spec.ts, plus-sickness.spec.ts and
  // photos.spec.ts kept some) are folded behind one quiet line, not shown on every visit, with no lens
  // of their own, nothing new offered, and nothing shown first.
  await open("/journal");
  await expect(page.getByText("Felt moving")).toHaveCount(0);
  await expect(page.getByText("Pickles")).toHaveCount(0);
  // No week counted, nothing about the baby, and no firsts to write.
  await expect(page.getByRole("region", { name: "This week" })).toBeHidden();
  await expect(page.getByRole("region", { name: "Around now" })).toBeHidden();
  await expect(page.getByRole("region", { name: "Already happened" })).toBeHidden();
  await expect(page.getByRole("link", { name: /^Our pregnancy/ })).toBeHidden();
  await expect(page.getByRole("region", { name: "Your book" })).toBeHidden();
  await expect(page.getByRole("radio", { name: "Movements" })).toBeHidden();
  await expect(page.getByRole("list", { name: "Keep" }).getByRole("button", { name: "Moved" })).toBeHidden();
  await expect(page.getByRole("list", { name: "Keep" }).getByRole("button", { name: "Note" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Now" })).toBeHidden();
  await expect(page.getByRole("region", { name: "Lately" })).toBeHidden();
  await page.getByRole("button", { name: "What you kept before" }).click();
  const kept = page.getByRole("region", { name: "What you kept before" });
  await expect(kept.getByText("Felt moving").first()).toBeVisible();
  await expect(kept.getByText("Pickles").first()).toBeVisible();
  await expect(kept.getByRole("img", { name: /^Bump photo, week 28/ })).toBeVisible();
  // Plain: no bump week by week, no frame for this week.
  await expect(page.getByRole("region", { name: "Your bump, week by week" })).toBeHidden();
  await expect(kept.getByRole("button", { name: "Add a photo" })).toBeVisible();

  // The Drawer is put away; Emergency info stops counting the weeks.
  await open("/drawer");
  await expect(page.getByText(/put away while Expecting is quiet/)).toBeVisible();
  await expect(page.getByText("Contraction timer")).toBeHidden();
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
