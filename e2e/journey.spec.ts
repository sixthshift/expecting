// The household's first evening with the timeline: a due date, moving along
// the ruler, a task of their own that stays ticked, a jump from a task to why
// it matters, and a question for the midwife. Runs first, on the phone, against
// the empty database the config makes.
import { expect, test } from "./fixtures";

/** dd, mm, yyyy of today plus `days`, in this machine's local time, as the app sees it. */
function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}${d.getFullYear()}`;
}

test.describe.configure({ mode: "serial" });

const week = (page: import("@playwright/test").Page, key: string) => page.locator(`[data-week="${key}"]`);

test.describe("the first evening", () => {
  // This phone is the household's first: nobody to choose yet.
  test.use({ person: null });

  test("onboarding asks who, then the due date, and opens the timeline at this week", async ({ page, open }) => {
    await open("/");
    await expect(page).toHaveURL(/\/welcome$/);
    await expect(page.getByRole("heading", { name: "Welcome to Expecting. Who's holding this phone?" })).toBeVisible();

    await page.getByLabel("Your name").fill("Jason");
    await page.getByRole("button", { name: "I'm the partner" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("button", { name: "Yes, we're expecting" }).click();

    // Each new screen takes focus to its question.
    await expect(page.getByRole("heading", { name: "When's the baby due?" })).toBeFocused();
    await page.getByRole("spinbutton", { name: /day/i }).click();
    // 12 weeks to go is 28+0.
    await page.keyboard.type(daysFromToday(12 * 7));
    await page.getByRole("button", { name: "Next" }).click();

    await page.getByRole("button", { name: "Don't know / surprise" }).click();
    // Private cover and the state: skipped, so nothing is hidden.
    await page.getByRole("button", { name: "Skip for now" }).click();
    await page.getByRole("button", { name: "Skip for now" }).click();

    await expect(page.getByRole("heading", { name: "You're all set" })).toBeVisible();
    await expect(page.getByText("Expecting opens at week 28 (28+0)")).toBeVisible();
    await page.getByRole("button", { name: "Open Expecting" }).click();

    await expect(week(page, "28").getByRole("heading", { name: "28 weeks" })).toBeVisible();
    await expect(page.getByText("28+0 · 84 days to go")).toBeVisible();
    await expect(page.getByRole("slider", { name: "Timeline" })).toHaveAttribute("aria-valuetext", "Week 28");
  });
});

test("the second phone is only asked who it is", async ({ page, open }) => {
  // The fixture has already said "I'm Jason"; this phone is someone new.
  await open("/settings");
  await expect(page.getByText("This is Jason's phone.")).toBeVisible();
  await page.getByRole("button", { name: "Someone else is using it" }).click();

  await expect(page.getByRole("heading", { name: "Who's this?" })).toBeVisible();
  await page.getByRole("button", { name: "Someone else" }).click();
  await page.getByLabel("Your name").fill("Sam");
  // The household has a partner, so the second person is offered the other role.
  await expect(page.getByRole("button", { name: "I'm the one who's pregnant (or will be)" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Continue" }).click();

  // The household is already set up: straight to the timeline.
  await expect(week(page, "28").getByRole("heading", { name: "28 weeks" })).toBeVisible();
  await open("/settings");
  await expect(page.getByText("This is Sam's phone. Expecting is shared by Jason and Sam.")).toBeVisible();
});

test("the ruler moves along the timeline, and Today comes back", async ({ page, open }) => {
  await open("/");
  const ruler = page.getByRole("slider", { name: "Timeline" });
  await ruler.focus();
  await page.keyboard.press("PageDown");
  await expect(ruler).toHaveAttribute("aria-valuetext", "Week 32");
  await expect(week(page, "32")).toBeInViewport();
  // A settled move opens the week it lands on.
  await expect(week(page, "32").getByRole("textbox", { name: "New task for Week 32" })).toBeVisible();

  await page.keyboard.press("End");
  await expect(ruler).toHaveAttribute("aria-valuetext", "Week 12 after birth");
  await expect(week(page, "pp12")).toBeInViewport();

  await page.getByRole("button", { name: "Today" }).click();
  await expect(week(page, "28")).toBeInViewport();
});

test("an own task is added to its week, and the Planner has it", async ({ page, open }) => {
  await open("/");
  await week(page, "28").getByRole("textbox", { name: "New task for Week 28" }).fill("Pack the snacks for the hospital");
  await week(page, "28").getByRole("button", { name: "Add task" }).click();
  await expect(week(page, "28").getByRole("checkbox", { name: "Pack the snacks for the hospital" })).toBeVisible();

  await page.getByRole("navigation", { name: "Expecting" }).getByRole("link", { name: "Planner" }).click();
  const task = page.getByRole("checkbox", { name: "Pack the snacks for the hospital" });
  await expect(task).toBeVisible();
  await task.click();
  // Ticked this visit, it stays where it was; on the next, it's done.
  await expect(task).toBeChecked();
  await page.reload({ waitUntil: "networkidle" });
  await expect(task).toBeHidden();
  await page.getByRole("button", { name: /^Done/ }).click();
  await expect(task).toBeChecked();

  await open("/");
  await expect(week(page, "28").getByRole("checkbox", { name: "Pack the snacks for the hospital" })).toBeChecked();
});

test("Why goes from a task to the item that explains it, and on to its week", async ({ page, open }) => {
  await open("/planner");
  await page.getByRole("link", { name: "Why: Book the RSV vaccine" }).click();
  await expect(page).toHaveURL(/\/library\/rsv-vaccine$/);
  await expect(page.getByRole("heading", { level: 1, name: "The RSV vaccine" })).toBeAttached();

  await page.getByRole("link", { name: "See week 28 on the timeline" }).click();
  await expect(week(page, "28")).toBeInViewport();
});

test("the Library finds things, and keeps nobody-tells-you on a shelf of its own", async ({ page, open }) => {
  await open("/library");
  await expect(page.getByRole("region", { name: "Nobody tells you" }).getByRole("link", { name: /The RSV vaccine/ })).toBeVisible();

  await page.getByLabel("Search the library").fill("whooping cough");
  await expect(page).toHaveURL(/q=whooping/);
  await expect(page.getByRole("region", { name: "Results" }).getByRole("link", { name: /The whooping cough vaccine/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Nobody tells you" })).toBeHidden();
});

test("a question is added in the Planner, asked, and lands in this week", async ({ page, open }) => {
  await open("/planner");
  await page.getByRole("textbox", { name: "New question" }).fill("Which hospital entrance after hours?");
  await page.getByRole("button", { name: "Add question" }).click();
  await expect(page.getByText("Which hospital entrance after hours?")).toBeVisible();

  await page.getByRole("button", { name: "Asked it" }).click();
  await page.getByRole("textbox", { name: "Answer" }).fill("Emergency, then the lift to level 3.");
  await page.getByRole("button", { name: "Save as asked" }).click();
  await expect(page.getByRole("button", { name: "Asked it" })).toBeHidden();

  await open("/");
  await expect(week(page, "28").getByText("Emergency, then the lift to level 3.")).toBeVisible();
});

test("the answer to boy or girl sets the colours, and they survive a reload", async ({ page, open }) => {
  const theme = () => page.evaluate(() => document.documentElement.dataset.expectingTheme ?? "baby-purple");
  await open("/settings");
  expect(await theme()).toBe("baby-purple");

  await page.getByRole("radio", { name: "Girl" }).click();
  await expect.poll(theme).toBe("baby-pink");
  await page.reload({ waitUntil: "networkidle" });
  expect(await theme()).toBe("baby-pink");

  await page.getByRole("radio", { name: "Boy" }).click();
  await expect.poll(theme).toBe("baby-blue");
  await page.getByRole("link", { name: "Timeline" }).click();
  await expect(page.getByRole("slider", { name: "Timeline" })).toBeVisible();
  expect(await theme()).toBe("baby-blue");

  await open("/settings");
  await page.getByRole("radio", { name: "Don't know / surprise" }).click();
  await expect.poll(theme).toBe("baby-purple");
});

test("an answer in settings tailors the timeline, and clearing it puts things back", async ({ page, open }) => {
  const privateHealth = page.locator("#item-private-health-waiting-period");
  const rsv = page.locator("#item-rsv-vaccine");

  // Unanswered: everything shows, and the body reads for public care. (`before` is the old key, still accepted.)
  await open("/?at=before");
  await expect(privateHealth).toBeVisible();
  await open("/");
  await expect(rsv.getByText("Your GP, the hospital's antenatal clinic")).toBeVisible();

  await open("/settings");
  await page.getByRole("radio", { name: "Yes", exact: true }).click();
  const clearCover = page.getByRole("button", { name: "Clear answer: Do you have private hospital cover that includes pregnancy and birth?" });
  await expect(clearCover).toBeVisible();

  // Private cover: the waiting-period item has nothing to say, and the RSV item speaks to an obstetrician.
  await open("/?at=preconception");
  await expect(week(page, "preconception")).toBeVisible();
  await expect(privateHealth).toHaveCount(0);
  await open("/");
  await expect(rsv.getByText("Seeing a private obstetrician?")).toBeVisible();
  await expect(rsv.getByText("Your GP, the hospital's antenatal clinic")).toHaveCount(0);

  await open("/settings");
  await clearCover.click();
  await expect(page.getByText("Not answered").first()).toBeVisible();
  await open("/?at=preconception");
  await expect(privateHealth).toBeVisible();
});

test("an item draws its window against today, and offers its questions", async ({ page, open }) => {
  await open("/");
  const rsv = page.locator("#item-rsv-vaccine");
  await expect(rsv.getByRole("figure", { name: /Weeks 28 to 36/ })).toBeVisible();
  await expect(rsv.getByText("Open now · 8 weeks left")).toBeVisible();

  const text = "If the baby comes within 2 weeks of the vaccine, will they need the infant antibody?";
  await rsv.getByRole("button", { name: `Add to your questions: ${text}` }).click();
  await expect(rsv.getByText("On your list").first()).toBeVisible();

  await open("/planner");
  await expect(page.getByText(text)).toBeVisible();
});

test("the baby's here: Expecting becomes the newborn's, and clearing the birth date brings the pregnancy back", async ({ page, open }) => {
  const nav = page.getByRole("navigation", { name: "Expecting" });
  const babysHere = page.locator("section", { has: page.getByRole("heading", { name: "Baby's here" }) });

  await open("/settings");
  await babysHere.getByRole("spinbutton", { name: /day/i }).click();
  await page.keyboard.type(daysFromToday(0));
  await page.getByRole("button", { name: "Save birth date" }).click();

  await nav.getByRole("link", { name: "This week" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "This week" })).toBeVisible();
  await expect(page.getByText("Born today · week 1 after birth")).toBeVisible();
  await expect(nav.getByRole("link", { name: "Timeline" })).toHaveCount(0);
  await expect(page.getByRole("slider", { name: "Timeline" })).toHaveCount(0);

  // The same Planner, planning for the newborn: the pregnancy's open tasks are left behind, folded, not slipped.
  await nav.getByRole("link", { name: "Planner" }).click();
  await expect(page.getByRole("heading", { name: "For the next check-up" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^From the pregnancy/ })).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("checkbox", { name: "Book the RSV vaccine" })).toBeHidden();

  // The newborn's Journal and Toolkit, at the same addresses, and no way back to a week of the pregnancy.
  await nav.getByRole("link", { name: "Journal" }).click();
  await expect(page.getByText("The birth story", { exact: true })).toBeVisible();
  await nav.getByRole("link", { name: "Toolkit" }).click();
  await expect(page.getByText("Feeds", { exact: true })).toBeVisible();
  await open("/library/rsv-vaccine");
  await expect(page.getByRole("link", { name: /on the timeline/ })).toHaveCount(0);

  await open("/settings");
  await babysHere.getByRole("button", { name: "Clear date" }).click();
  await page.getByRole("button", { name: "Save birth date" }).click();
  await nav.getByRole("link", { name: "Timeline" }).click();
  await expect(page.getByRole("slider", { name: "Timeline" })).toBeVisible();
});
