// A question a week: one question for the two of you each week, answered on
// your own phones. Neither sees the other's answer until both have given one;
// then both are in the Journal, under the week.
import { expect, test } from "./fixtures";
import { PASSWORD } from "./playwright.config";

test("a question a week: answered on two phones, shown once both have, and kept in the Journal", async ({ page, open, browser }) => {
  await open("/settings");
  const toggle = page.getByRole("switch", { name: "A question a week" });
  if (!(await toggle.isChecked())) await toggle.click();
  await expect(toggle).toBeChecked();

  // Week 28's question, on This week.
  await open("/");
  const card = page.getByRole("region", { name: "This week's question" });
  await expect(card.getByText("What's one thing you'd like to do together before they arrive?")).toBeVisible();
  await card.getByRole("textbox", { name: /^Your answer/ }).fill("A long lunch by the water");
  await card.getByRole("button", { name: "Keep my answer" }).click();
  await expect(card.getByText("Waiting for Sam.")).toBeVisible();

  // An earlier week's, folded away, still to answer.
  await card.getByRole("button", { name: "Earlier weeks' questions" }).click();
  await expect(card.getByText("What do you hope home feels like to them?")).toBeVisible();

  // Sam, on the other phone, doesn't see Jason's answer until she's given hers.
  const phone = await browser.newContext();
  const sam = await phone.newPage();
  await sam.goto("/login", { waitUntil: "networkidle" });
  await sam.getByLabel("Password").fill(PASSWORD);
  await sam.getByRole("button", { name: "Log in" }).click();
  await sam.waitForURL((url) => url.pathname !== "/login");
  await sam.goto("/onboarding", { waitUntil: "networkidle" });
  await sam.getByRole("button", { name: "I'm Sam" }).click();
  await sam.waitForURL((url) => !url.pathname.startsWith("/onboarding"));
  await sam.goto("/", { waitUntil: "networkidle" });
  const samCard = sam.getByRole("region", { name: "This week's question" });
  await expect(samCard.getByText("A long lunch by the water")).toHaveCount(0);
  await samCard.getByRole("textbox", { name: /^Your answer/ }).fill("Sleep in, then the beach");
  await samCard.getByRole("button", { name: "Keep my answer" }).click();
  await expect(samCard.getByText("A long lunch by the water")).toBeVisible();
  await phone.close();

  // Jason sees both, and the Journal keeps them under the week.
  await page.reload();
  await expect(card.getByText("Sleep in, then the beach")).toBeVisible();
  await open("/journal");
  await expect(page.getByText("What's one thing you'd like to do together before they arrive?").first()).toBeVisible();
  await expect(page.getByText("Sleep in, then the beach").first()).toBeVisible();
});
