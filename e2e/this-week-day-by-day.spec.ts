// Day by day: after the week's note, a read a day. The journey's due date
// makes today 28+0, the note's day, with no read yet; four days on it's 28+4,
// four reads, today's showing, the days before a step back, each opening onto
// its entries in the Library.
import { expect, test } from "./fixtures";

test("a read a day after the note, today's first, the days before a step back", async ({ page, open }) => {
  await open("/");
  await expect(page.getByRole("region", { name: /^Day by day/ })).toHaveCount(0);

  await page.clock.setFixedTime(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000));
  await open("/");
  const reads = page.getByRole("region", { name: "Day by day" });
  await expect(reads.getByRole("region", { name: "28+4 · Today, 4 of 4" })).toBeVisible();
  await expect(reads.getByRole("button", { name: "The day after" })).toBeDisabled();

  await reads.getByRole("button", { name: "The day before" }).click();
  const yesterday = reads.getByRole("region", { name: "28+3 · Yesterday, 3 of 4" });
  await expect(yesterday).toBeVisible();

  // A read opens onto its entries.
  await yesterday.getByRole("link").first().click();
  await expect(page).toHaveURL(/\/library\/[a-z0-9-]+$/);
});
