// The week, day by day: the week's note is its first day, then a read a day.
// The journey's due date makes today 28+0, the note's day, the note alone;
// four days on it's 28+4, the note and four reads, today's showing, the days
// before a step back, each read opening onto its entries in the Library.
import { expect, test } from "./fixtures";

test("the note on the first day, a read a day after it, today's first, the days before a step back", async ({ page, open }) => {
  await open("/");
  const week = page.getByRole("region", { name: "Week 28", exact: true });
  await expect(week.getByRole("region", { name: "28+0 · Today, 1 of 1" })).toBeVisible();
  await expect(week.getByRole("button", { name: "The day before" })).toHaveCount(0);

  await page.clock.setFixedTime(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000));
  await open("/");
  await expect(week.getByRole("region", { name: "28+4 · Today, 5 of 5" })).toBeVisible();
  await expect(week.getByRole("button", { name: "The day after" })).toBeDisabled();

  await week.getByRole("button", { name: "The day before" }).click();
  const yesterday = week.getByRole("region", { name: "28+3 · Yesterday, 4 of 5" });
  await expect(yesterday).toBeVisible();

  // A read opens onto its entries.
  await yesterday.getByRole("link").first().click();
  await expect(page).toHaveURL(/\/library\/[a-z0-9-]+$/);
});
