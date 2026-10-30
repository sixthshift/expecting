// The Journal as one story (docs/plan-journal.md): kept from its Keep row and
// shown as just kept, without leaving the page; the lenses there's something
// for; a first marked and answered in your own words; a letter to the baby;
// what the other kept since you looked; zoomed out and back to a week; the
// search; and the book. Runs last, as specs run by name: after the others
// have kept notes, movements, sickness and cravings, a bump, papers and a
// feeling, at week 28.
import { expect, test } from "./fixtures";

test("kept from the Keep row, it's shown as just kept, and the page stays the Journal", async ({ page, open }) => {
  await open("/journal");
  await page.getByRole("list", { name: "Keep" }).getByRole("button", { name: "Note" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("textbox", { name: "New note" }).fill("Painted the nursery yellow");
  await sheet.getByRole("button", { name: "Keep it" }).click();
  await expect(sheet).toBeHidden();
  await expect(page).toHaveURL(/\/journal\?kept=/);
  await expect(page.getByText("In the Journal")).toBeHidden();
  const now = page.getByRole("region", { name: "Now" });
  await expect(now.getByText("Just kept")).toBeVisible();
  await expect(now.getByText("Painted the nursery yellow")).toBeVisible();
  await now.getByRole("button", { name: "Put this away" }).click();
  await expect(now.getByText("Just kept")).toBeHidden();
  // And on this week's page.
  await expect(page.getByRole("region", { name: "This week" }).getByText("Painted the nursery yellow")).toBeVisible();
});

test("a lens for each kind kept, its pattern at full size, in the address", async ({ page, open }) => {
  await open("/journal");
  const show = page.getByRole("radiogroup", { name: "Show" });
  for (const lens of ["All", "Notes", "Movements", "Sickness & cravings", "Photos", "Feelings", "Papers"]) {
    await expect(show.getByRole("radio", { name: lens, exact: true })).toBeVisible();
  }
  // No first is marked yet: no lens for them.
  await expect(show.getByRole("radio", { name: "Firsts" })).toBeHidden();
  await show.getByRole("radio", { name: "Movements" }).click();
  await expect(page).toHaveURL(/show=movements/);
  await expect(page.getByRole("region", { name: "Movements" }).getByRole("figure")).toBeVisible();
  await show.getByRole("radio", { name: "Papers" }).click();
  await expect(page.getByRole("region", { name: "Results and papers" })).toBeVisible();
});

test("a first, marked and answered in your own words, then in its lens and on the whole pregnancy's line", async ({ page, open }) => {
  await open("/journal");
  await page.getByRole("list", { name: "Keep" }).getByRole("button", { name: "A first" }).click();
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

  await open("/journal?zoom=pregnancy");
  await expect(page.getByRole("list", { name: "Your firsts" }).getByText("Bought the first outfit")).toBeVisible();
});

test("this week's page, before anything else: the week, around now's firsts to write, and what's still to come", async ({ page, open }) => {
  await open("/journal");
  const week = page.getByRole("region", { name: "This week" });
  await expect(week.getByRole("heading", { name: /^Week 28/ })).toBeVisible();
  const around = page.getByRole("region", { name: "Around now" });
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

test("a first suggested from what's kept is only a question, and put aside isn't asked again", async ({ page, open }) => {
  await open("/journal");
  // The cravings kept earlier suggest the first craving, first: suggestions come in the order firsts do.
  const now = page.getByRole("region", { name: "Now" });
  await expect(now.getByText("The first craving?")).toBeVisible();
  await expect(now.getByText(/^The first craving you kept, /)).toBeVisible();
  await now.getByRole("button", { name: "Not this" }).click();
  await expect(now.getByText("The first craving?")).toBeHidden();
  // Then the next: the bump photo kept suggests showing.
  await expect(now.getByText("Started showing?")).toBeVisible();
  await open("/journal");
  await expect(page.getByText("The first craving?")).toBeHidden();
});

test("a letter to the baby, said so in the story", async ({ page, open }) => {
  await open("/journal");
  await page.getByRole("list", { name: "Keep" }).getByRole("button", { name: "Note" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("checkbox", { name: "A letter to the baby" }).click();
  await sheet.getByRole("textbox", { name: "New note" }).fill("Dear little one, we can't wait");
  await sheet.getByRole("button", { name: "Keep it" }).click();
  const week = page.getByRole("region", { name: "This week" });
  await expect(week.getByText("Dear little one, we can't wait")).toBeVisible();
  await expect(week.getByText("A letter to the baby").first()).toBeVisible();
});

test.describe("Sam, on the other phone", () => {
  test.use({ person: "Sam" });
  test("keeps a note", async ({ page, open }) => {
    await open("/journal");
    await page.getByRole("list", { name: "Keep" }).getByRole("button", { name: "Note" }).click();
    await page.getByRole("dialog").getByRole("textbox", { name: "New note" }).fill("Felt a kick through the couch");
    await page.getByRole("dialog").getByRole("button", { name: "Keep it" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

test("what Sam kept since Jason last looked, once", async ({ page, open }) => {
  await open("/journal");
  const now = page.getByRole("region", { name: "Now" });
  await expect(now.getByText("Since you looked")).toBeVisible();
  await expect(now.getByText("Sam kept a note.")).toBeVisible();
  await now.getByRole("button", { name: "See them" }).click();
  await expect(now.getByText("Felt a kick through the couch")).toBeVisible();
  // Looked at now: not again.
  await open("/journal");
  await expect(page.getByText("Since you looked")).toBeHidden();
});

test("zoomed out to the weeks, a week opens the story at it; the search finds any kind", async ({ page, open }) => {
  await open("/journal");
  await page.getByRole("radiogroup", { name: "Zoom" }).getByRole("radio", { name: "Weeks" }).click();
  await expect(page).toHaveURL(/zoom=weeks/);
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
