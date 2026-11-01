// Pregnancy bingo, the Drawer's: a card each, dealt on your own phone. A
// square marked when it happens; the middle row, with its free centre, is
// bingo with four marks. The other sees your card, and the Journal keeps it.
import { expect, test, waitingSaves } from "./fixtures";
import { PASSWORD } from "./playwright.config";

test("pregnancy bingo: dealt, the middle row marked to bingo, seen on the other phone and in the Journal", async ({ page, open, browser }) => {
  await open("/settings");
  const toggle = page.getByRole("switch", { name: "Pregnancy bingo" });
  if (!(await toggle.isChecked())) await toggle.click();
  await expect(toggle).toBeChecked();

  await open("/drawer");
  await page.getByRole("link", { name: /^Pregnancy bingo/ }).click();
  await expect(page).toHaveURL(/\/drawer\/bingo$/);
  await page.getByRole("button", { name: "Deal my card" }).click();
  const card = page.getByRole("list", { name: "Your card" });
  await expect(card.getByRole("listitem")).toHaveCount(25);
  // Dealt again, until something's marked; both deals through before a square's marked, so it's marked on the card that stays.
  await page.getByRole("button", { name: "Deal again" }).click();
  await expect.poll(() => waitingSaves(page)).toBe(0);

  // The middle row: the free centre and four squares, the 11th to 14th buttons.
  const squares = card.getByRole("button");
  for (const [i, n] of [10, 11, 12, 13].entries()) {
    await squares.nth(n).click();
    const sheet = page.getByRole("dialog");
    if (i === 0) await sheet.getByRole("textbox", { name: "A few words" }).fill("at the bakery");
    await sheet.getByRole("button", { name: "It happened" }).click();
    await expect(sheet).toBeHidden();
    if (i === 2) await expect(page.getByText("One away from bingo!")).toBeVisible();
  }
  await expect(page.getByRole("region", { name: "Bingo" }).getByText("Bingo! You got there first.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Deal again" })).toHaveCount(0);
  await expect(squares.nth(10)).toHaveAttribute("aria-pressed", "true");

  // Sam sees Jason's card, his words, and deals her own.
  const phone = await browser.newContext();
  const sam = await phone.newPage();
  await sam.goto("/login", { waitUntil: "networkidle" });
  await sam.getByLabel("Password").fill(PASSWORD);
  await sam.getByRole("button", { name: "Log in" }).click();
  await sam.waitForURL((url) => url.pathname !== "/login");
  await sam.goto("/onboarding", { waitUntil: "networkidle" });
  await sam.getByRole("button", { name: "I'm Sam" }).click();
  await sam.waitForURL((url) => !url.pathname.startsWith("/onboarding"));
  await sam.goto("/drawer/bingo", { waitUntil: "networkidle" });
  await expect(sam.getByText("Bingo! Jason got there first.")).toBeVisible();
  await sam.getByRole("radio", { name: /^Jason/ }).click();
  const his = sam.getByRole("list", { name: "Jason's card" });
  await his.getByRole("button").nth(10).click();
  await expect(sam.getByRole("dialog").getByText(/at the bakery/)).toBeVisible();
  await sam.keyboard.press("Escape");
  await sam.getByRole("radio", { name: /^You/ }).click();
  await sam.getByRole("button", { name: "Deal my card" }).click();
  await expect(sam.getByRole("list", { name: "Your card" }).getByRole("listitem")).toHaveCount(25);
  await phone.close();

  // The Journal keeps it.
  await open("/journal");
  await expect(page.getByText("You got bingo!").first()).toBeVisible();
});
