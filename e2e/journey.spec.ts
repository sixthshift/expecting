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

  test("onboarding asks who, then the due date, and opens at this week", async ({ page, open }) => {
    await open("/");
    await expect(page).toHaveURL(/\/onboarding\/who$/);
    await expect(page.getByRole("heading", { name: "Welcome to Expecting. Who's holding this phone?" })).toBeVisible();

    await page.getByLabel("Your name").fill("Jason");
    await page.getByRole("button", { name: "I'm the partner" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Each new screen takes focus to its question.
    await expect(page.getByRole("heading", { name: "When's the baby due?" })).toBeFocused();
    await page.getByRole("spinbutton", { name: /day/i }).click();
    // 12 weeks to go is 28+0.
    await page.keyboard.type(daysFromToday(12 * 7));
    await page.getByRole("button", { name: "Next" }).click();

    // Each question is its own page: the phone's back gesture goes back one, with the answer kept.
    await expect(page).toHaveURL(/\/onboarding\/baby$/);
    await page.goBack();
    await expect(page.getByRole("heading", { name: "When's the baby due?" })).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page).toHaveURL(/\/onboarding\/baby$/);

    await page.getByRole("button", { name: "Don't know / surprise" }).click();
    await expect(page.getByRole("heading", { name: "Do you know if it's a boy or a girl?" })).toBeHidden();
    // The questions that build the plan: all skipped, so nothing is hidden.
    // A skip saves, then moves to the next question's page: wait for that page before asking again.
    const allSet = page.getByRole("heading", { name: "You're all set" });
    const skip = page.getByRole("button", { name: "Skip for now" });
    while (!(await allSet.isVisible())) {
      const question = await page.getByRole("heading", { level: 1 }).textContent();
      await skip.click();
      await expect(page.getByRole("heading", { level: 1, name: question ?? "" })).toBeHidden();
      await expect(allSet.or(skip)).toBeVisible();
    }

    await expect(page.getByRole("heading", { name: "You're all set" })).toBeVisible();
    await expect(page.getByText("Expecting opens at week 28 (28+0)")).toBeVisible();
    await page.getByRole("button", { name: "Open Expecting" }).click();

    await expect(page.getByRole("heading", { level: 1, name: "This week Week 28" })).toBeVisible();
    await expect(page).toHaveURL((url) => url.pathname === "/");
    await expect(page.getByText("28+0 · 84 days to go")).toBeVisible();
    // The timeline opens at this week too.
    await page.getByRole("navigation", { name: "Expecting" }).getByRole("link", { name: "Timeline" }).click();
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

  // The household is already set up: straight to This week.
  await expect(page.getByRole("heading", { level: 1, name: "This week Week 28" })).toBeVisible();
  // The week's note reads as the one holding the phone, and flips to the other.
  const note = page.getByRole("article", { name: "The home stretch begins" });
  await expect(note.getByRole("heading", { name: "Your body" })).toBeVisible();
  await expect(note.getByRole("heading", { name: "For the partner" })).toHaveCount(0);
  await note.getByRole("radio", { name: "For Jason" }).click();
  await expect(note.getByRole("heading", { name: "For the partner" })).toBeVisible();
  await expect(note.getByRole("heading", { name: "Your body" })).toHaveCount(0);
  await open("/settings");
  await expect(page.getByText("This is Sam's phone. Expecting is shared by Jason and Sam.")).toBeVisible();
});

test("the ruler moves along the timeline, and Today comes back", async ({ page, open }) => {
  await open("/timeline");
  const ruler = page.getByRole("slider", { name: "Timeline" });
  await ruler.focus();
  await page.keyboard.press("PageDown");
  await expect(ruler).toHaveAttribute("aria-valuetext", "Week 32");
  await expect(week(page, "32")).toBeInViewport();
  // A settled move opens the week it lands on.
  await expect(week(page, "32").getByRole("button", { expanded: true })).toBeVisible();

  await page.keyboard.press("End");
  await expect(ruler).toHaveAttribute("aria-valuetext", "Week 42");
  await expect(week(page, "42")).toBeInViewport();

  await page.getByRole("button", { name: "Today" }).click();
  await expect(week(page, "28")).toBeInViewport();
});

test("an own task is added in the Planner, and lands on its week", async ({ page, open }) => {
  await open("/planner");
  await page.getByRole("textbox", { name: "New task for Week 28" }).fill("Pack the snacks for the hospital");
  await page.getByRole("button", { name: "Add task" }).click();
  const task = page.getByRole("checkbox", { name: "Pack the snacks for the hospital" });
  await expect(task).toBeVisible();
  await task.click();
  // Ticked this visit, it stays where it was; on the next, it's done.
  await expect(task).toBeChecked();
  await page.reload({ waitUntil: "networkidle" });
  await expect(task).toBeHidden();
  await page.getByRole("button", { name: /^Done/ }).click();
  await expect(task).toBeChecked();

  await open("/timeline");
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

  await open("/timeline");
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

test("an answer in settings tailors an item, and clearing it puts it back", async ({ page, open }) => {
  const rsv = page.locator("#item-rsv-vaccine");

  // Unanswered: the body reads for public care.
  await open("/timeline");
  await expect(rsv.getByText("Your GP, the hospital's antenatal clinic")).toBeVisible();

  await open("/settings");
  await page
    .getByRole("radiogroup", { name: "Do you have private hospital cover that includes pregnancy and birth?" })
    .getByRole("radio", { name: "Yes" })
    .click();
  const clearCover = page.getByRole("button", { name: "Clear answer: Do you have private hospital cover that includes pregnancy and birth?" });
  await expect(clearCover).toBeVisible();

  // Private cover: the RSV item speaks to an obstetrician.
  await open("/timeline");
  await expect(rsv.getByText("Seeing a private obstetrician?")).toBeVisible();
  await expect(rsv.getByText("Your GP, the hospital's antenatal clinic")).toHaveCount(0);

  await open("/settings");
  await clearCover.click();
  await expect(page.getByText("Not answered").first()).toBeVisible();
  await open("/timeline");
  await expect(rsv.getByText("Your GP, the hospital's antenatal clinic")).toBeVisible();
});

test("This week asks what Expecting needs to know, and an answer changes the plan", async ({ page, open }) => {
  const childcareTask = page.getByRole("checkbox", { name: "Shortlist childcare centres and join their waiting lists" });
  await open("/planner");
  await expect(childcareTask).toBeVisible();

  // At 28+0, onboarding's questions were skipped this week; the ones whose week has passed are asked now.
  await open("/");
  const ask = page.getByRole("region", { name: "Expecting needs to know" });
  const childcare = ask.getByRole("group", { name: "Will you want childcare in the baby's first two years?" });
  await childcare.getByRole("radio", { name: "No", exact: true }).click();
  await expect(childcare).toHaveCount(0);
  await open("/planner");
  await expect(childcareTask).toHaveCount(0);

  // Not now puts a question off, without answering it.
  await open("/");
  const rhd = ask.getByRole("group", { name: "Is the pregnant parent's blood group RhD negative?" });
  await rhd.getByRole("button", { name: /^Not now/ }).click();
  await expect(rhd).toHaveCount(0);

  // Settings says who answered, and clearing it puts the plan back.
  await open("/settings");
  await expect(page.getByText(/^Jason answered,/)).toBeVisible();
  await page.getByRole("button", { name: "Clear answer: Will you want childcare in the baby's first two years?" }).click();
  await open("/planner");
  await expect(childcareTask).toBeVisible();
});

test("This week opens with what to do now: a deadline coming up first, and why", async ({ page, open }) => {
  await open("/");
  const toDo = page.getByRole("region", { name: "To do now" });
  // At 28+0, the deadlines lead, soonest first: the glucose test (by week 28), then written notice to the employer (week 30).
  const tasks = toDo.getByRole("checkbox");
  await expect(tasks.nth(0)).toHaveAccessibleName("Book the glucose tolerance test");
  await expect(tasks.nth(1)).toHaveAccessibleName("Give your employer written notice of parental leave");
  await expect(toDo.getByText("deadline week 30")).toBeVisible();
  await toDo.getByRole("link", { name: "Why: Give your employer written notice of parental leave" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Telling your employer about parental leave" })).toBeAttached();
});

test("an item draws its window against today, and offers its questions", async ({ page, open }) => {
  await open("/timeline");
  const rsv = page.locator("#item-rsv-vaccine");
  await expect(rsv.getByRole("figure", { name: /Weeks 28 to 36/ })).toBeVisible();
  await expect(rsv.getByText("Open now · 8 weeks left")).toBeVisible();

  const text = "If the baby comes within 2 weeks of the vaccine, will they need the infant antibody?";
  await rsv.getByRole("button", { name: `Add to your questions: ${text}` }).click();
  await expect(rsv.getByText("On your list").first()).toBeVisible();

  await open("/planner");
  await expect(page.getByText(text)).toBeVisible();
});
