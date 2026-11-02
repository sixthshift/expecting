// The Journal as one story (docs/product/journal.md): kept from the "+",
// on this week's page without leaving the Journal; the lenses there's something
// for; a first marked and answered in your own words; a letter to the baby;
// zoomed out and back to a week; the
// search; and the book. Runs last, as specs run by name: after the others
// have kept notes, movements, sickness and cravings, a bump, papers and a
// feeling, at week 28.
import { expect, test } from "./fixtures";

test("kept from the \"+\" on the Journal, it's on this week's page, and the page stays the Journal", async ({ page, open }) => {
  await open("/journal");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "A note" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("textbox", { name: "New note" }).fill("Painted the nursery yellow");
  await sheet.getByRole("button", { name: "Keep it" }).click();
  await expect(sheet).toBeHidden();
  await expect(page).toHaveURL(/\/journal$/);
  // Said, with no way there: it's in front of you.
  await expect(page.getByText("In the Journal")).toBeVisible();
  await expect(page.getByRole("button", { name: "See it" })).toBeHidden();
  await expect(page.getByRole("region", { name: "This week" }).getByText("Painted the nursery yellow")).toBeVisible();
});

test("the story's lenses are ways to read it; the records say each kind in a few lines, and open it at full size", async ({ page, open }) => {
  await open("/journal");
  const show = page.getByRole("radiogroup", { name: "Show" });
  for (const lens of ["Days", "Weeks", "Whole pregnancy", "Notes", "Photos"]) {
    await expect(show.getByRole("radio", { name: lens, exact: true })).toBeVisible();
  }
  // What's looked up is in the records, not the story.
  await expect(show.getByRole("radio", { name: "Movements" })).toBeHidden();
  // No first is marked yet: no lens for them.
  await expect(show.getByRole("radio", { name: "Firsts" })).toBeHidden();

  await page.getByRole("navigation", { name: "Journal" }).getByRole("link", { name: "Records" }).click();
  await expect(page).toHaveURL(/\/journal\/records$/);
  // Each kind kept, as its answer: what's going on lately first.
  for (const record of ["Movements", "Sickness", "Cravings", "Feelings"]) {
    await expect(page.getByRole("region", { name: record, exact: true })).toBeVisible();
  }
  await expect(
    page
      .getByRole("region", { name: "Lately" })
      .getByRole("region", { name: "Movements" })
      .getByText(/^\d+ of the last 14 days$/)
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy as text" })).toBeVisible();
  await page.getByRole("link", { name: "Every movement" }).click();
  await expect(page).toHaveURL(/\/journal\/records\/movements$/);
  await expect(page.getByRole("region", { name: "Movements" }).getByRole("figure")).toBeVisible();
  await page.getByRole("link", { name: "All records" }).click();
  await page.getByRole("link", { name: /^(All \d+ papers|The paper)$/ }).click();
  await expect(page.getByRole("region", { name: "Results and papers" })).toBeVisible();
});

test("a first, marked and answered in your own words, then in its lens and on the whole pregnancy's line", async ({ page, open }) => {
  await open("/journal");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "A first" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("button", { name: "Bought the first outfit" }).click();
  await sheet.getByRole("button", { name: "Mark it" }).click();
  await expect(sheet.getByText("What is it, and who chose it?")).toBeVisible();
  await sheet.getByRole("textbox", { name: /Your words/ }).fill("A tiny yellow onesie, from Nan");
  await sheet.getByRole("button", { name: "Keep your words" }).click();
  await expect(sheet).toBeHidden();

  await page.getByRole("radiogroup", { name: "Show" }).getByRole("radio", { name: "Firsts" }).click();
  const firsts = page.getByRole("region", { name: "Firsts" });
  await expect(firsts.getByText("Bought the first outfit")).toBeVisible();
  await expect(firsts.getByText("A tiny yellow onesie, from Nan")).toBeVisible();

  await open("/journal?view=pregnancy");
  await expect(page.getByRole("list", { name: "Your firsts" }).getByText("Bought the first outfit")).toBeVisible();
});

test("this week's page, before anything else: the week, around now's firsts to write, and what's still to come", async ({ page, open }) => {
  await open("/journal");
  const week = page.getByRole("region", { name: "This week" });
  await expect(week.getByRole("heading", { name: /^Week 28/ })).toBeVisible();
  const around = page.getByRole("region", { name: "Has it happened yet?" });
  await expect(around.getByText("The cot is up")).toBeVisible();
  await expect(around.getByText("Where is it, and who put it together?")).toBeVisible();
  // What's already happened can still be kept, on the day it was.
  const already = page.getByRole("region", { name: "Already happened" });
  await expect(already.getByText("Some of this has already happened. You can still keep it, on the day it was.")).toBeVisible();
  await expect(already.getByRole("button", { name: "Found out" })).toBeVisible();
  // Under way, the book is one line at the top.
  await expect(page.getByRole("link", { name: /^Our pregnancy · \d+ chapters? begun/ })).toHaveAttribute("href", "/journal/book");

  const cot = around.getByRole("listitem").filter({ hasText: "The cot is up" });
  await cot.getByRole("button", { name: "Write it" }).click();
  await cot.getByRole("textbox", { name: /Your words/ }).fill("In our room, and it took both of us an hour");
  await cot.getByRole("button", { name: "Keep it" }).click();
  // Kept: no longer asked, and on this week's page in your words.
  await expect(around.getByText("The cot is up")).toBeHidden();
  await expect(week.getByRole("button", { name: "Open: The cot is up" })).toContainText("In our room, and it took both of us an hour");
});

test("a letter to the baby, said so in the story", async ({ page, open }) => {
  await open("/journal");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "A note" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("checkbox", { name: "A letter to the baby" }).click();
  await sheet.getByRole("textbox", { name: "New note" }).fill("Dear little one, we can't wait");
  await sheet.getByRole("button", { name: "Keep it" }).click();
  const week = page.getByRole("region", { name: "This week" });
  await expect(week.getByText("Dear little one, we can't wait")).toBeVisible();
  await expect(week.getByText("A letter to the baby").first()).toBeVisible();
});

test("zoomed out to the weeks, a week opens the story at it; the search finds any kind", async ({ page, open }) => {
  await open("/journal");
  await page.getByRole("radiogroup", { name: "Show" }).getByRole("radio", { name: "Weeks" }).click();
  await expect(page).toHaveURL(/view=weeks/);
  const third = page.getByRole("region", { name: "Third trimester" });
  await expect(third.getByRole("button", { name: /^Week 27, nothing kept$/ })).toHaveCount(0);
  await third.getByRole("button", { name: /^Week 28:/ }).click();
  await expect(page).toHaveURL(/at=28/);
  await expect(page.getByRole("region", { name: "This week" })).toBeVisible();

  await page.getByRole("textbox", { name: "Search the Journal" }).fill("pickles");
  const story = page.getByRole("list", { name: "The story" });
  await expect(story.getByText("Pickles", { exact: true }).first()).toBeVisible();
  await expect(story.getByText("Painted the nursery yellow")).toBeHidden();
});

test("the book: your names on its cover, its contents, and a chapter for each part, written in and filled, to print", async ({ page, open }) => {
  await open("/journal/book");
  await expect(page.getByRole("heading", { name: "Our pregnancy", level: 1 })).toBeVisible();
  await expect(page.getByText("Sam & Jason")).toBeVisible();
  const contents = page.getByRole("list", { name: "Contents" });
  await expect(contents.getByRole("listitem").filter({ hasText: "Getting ready" })).toContainText("Begun");
  await expect(contents.getByRole("listitem").filter({ hasText: "The last weeks" })).toContainText("Still to come");
  const ready = page.getByRole("region", { name: "Getting ready" });
  await expect(ready.getByText("Bought the first outfit")).toBeVisible();
  await expect(ready.getByText("Dear little one, we can't wait")).toBeVisible();
  // Expecting has written its weeks in.
  await expect(page.getByRole("region", { name: "Finding out" }).getByText("Week 4")).toBeVisible();
  await expect(page.getByRole("button", { name: "Print or save as a PDF" })).toBeEnabled();
});
