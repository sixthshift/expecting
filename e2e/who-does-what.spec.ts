// Who does what, the Drawer's: each of you says who'll do each newborn job on
// your own phone, and neither sees the other's answer to a job until both
// have given one. Then it's settled, or one to talk about.
import { expect, test } from "./fixtures";
import { PASSWORD } from "./playwright.config";

test("who does what: answered on two phones, settled where you agree, and to talk about where you don't", async ({ page, open, browser }) => {
  await open("/settings");
  const toggle = page.getByRole("switch", { name: "Who does what" });
  if (!(await toggle.isChecked())) await toggle.click();
  await expect(toggle).toBeChecked();
  await expect(page.getByText("And the jobs, in the Drawer")).toBeVisible();

  await open("/drawer");
  await page.getByRole("link", { name: /^Who does what/ }).click();
  await expect(page).toHaveURL(/\/drawer\/jobs$/);
  const deck = page.getByRole("region", { name: "To answer" });

  // Jason: he'll get up in the night, Sam does the feeds, the mornings together.
  await expect(deck.getByRole("article", { name: "Getting up when the baby wakes in the night" })).toBeVisible();
  await deck.getByRole("button", { name: "Me" }).click();
  // Taken back and given again.
  await deck.getByRole("button", { name: /^Undo/ }).click();
  await expect(deck.getByRole("article", { name: "Getting up when the baby wakes in the night" })).toBeVisible();
  await deck.getByRole("button", { name: "Me" }).click();
  await deck.getByRole("button", { name: "Sam" }).click();
  await deck.getByRole("button", { name: "Together" }).click();
  await expect(deck.getByRole("article", { name: "Nappies" })).toBeVisible();
  await expect(page.getByText("3 of your answers wait for theirs.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Settled" })).toHaveCount(0);

  // Sam, on the other phone, sees none of Jason's answers, and gives hers.
  const phone = await browser.newContext();
  const sam = await phone.newPage();
  await sam.goto("/login", { waitUntil: "networkidle" });
  await sam.getByLabel("Password").fill(PASSWORD);
  await sam.getByRole("button", { name: "Log in" }).click();
  await sam.waitForURL((url) => url.pathname !== "/login");
  await sam.goto("/onboarding", { waitUntil: "networkidle" });
  await sam.getByRole("button", { name: "I'm Sam" }).click();
  await sam.waitForURL((url) => !url.pathname.startsWith("/onboarding"));
  await sam.goto("/drawer/jobs", { waitUntil: "networkidle" });
  const samDeck = sam.getByRole("region", { name: "To answer" });
  await expect(sam.getByText("Jason has answered 3 of 18.")).toBeVisible();
  await samDeck.getByRole("button", { name: "Jason" }).click();
  await samDeck.getByRole("button", { name: "Me" }).click();
  await samDeck.getByRole("button", { name: "Me" }).click();
  await expect(sam.getByRole("region", { name: "Settled" }).getByText("Night feeds, or bringing the baby for one")).toBeVisible();
  await expect(sam.getByRole("region", { name: "To talk about" }).getByText("You said you; Jason said together")).toBeVisible();
  await phone.close();

  // Jason sees the same, from where he stands.
  await page.reload();
  const settled = page.getByRole("region", { name: "Settled" });
  await expect(settled.getByText("Getting up when the baby wakes in the night")).toBeVisible();
  await expect(settled.getByText("Sam", { exact: true })).toBeVisible();
  const talk = page.getByRole("region", { name: "To talk about" });
  await expect(talk.getByText("You said together; Sam said Sam")).toBeVisible();

  // Changing one deals it again, and it leaves the results.
  await talk.getByRole("button", { name: "Change: The early mornings, so the other can sleep in" }).click();
  await expect(page.getByRole("region", { name: "To talk about" })).toHaveCount(0);
  await expect(deck.getByRole("article", { name: "The early mornings, so the other can sleep in" })).toBeVisible();
});
