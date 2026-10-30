// The first evening with the timeline: a due date, moving along
// the ruler, a task of their own that stays ticked, a jump from a task to why
// it matters, and a question for the midwife. Runs first, on the phone, against
// the empty database the config makes.
import { expect, test } from "./fixtures";
import { PASSWORD } from "./playwright.config";

/** dd, mm, yyyy of today plus `days`, in this machine's local time, as the app sees it. */
function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}${d.getFullYear()}`;
}

test.describe.configure({ mode: "serial" });

const week = (page: import("@playwright/test").Page, key: string) => page.locator(`[data-week="${key}"]`);

test.describe("the first evening", () => {
  // This phone is the first: nobody to choose yet.
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
    await expect(week(page, "28").getByRole("link")).toHaveAttribute("aria-current", "date");
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
  // There's a partner already, so the second person is offered the other role.
  await expect(page.getByRole("button", { name: "I'm the one who's pregnant (or will be)" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Continue" }).click();

  // It's already set up: straight to This week.
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

test("the timeline is the map: what to do and when, the landmarks, and a week goes to This week", async ({ page, open }) => {
  await open("/timeline");
  const chart = page.getByRole("region", { name: "What to do, and when" });
  await expect(chart.getByRole("link", { name: /^The RSV vaccine, weeks 28 to 36, open now/ })).toBeVisible();
  await expect(chart.getByRole("link", { name: /^Packing the hospital bag, weeks \d+ to \d+, ahead/ })).toBeVisible();
  await expect(week(page, "20")).toContainText("Halfway");
  await expect(week(page, "28")).toContainText("RSV vaccine opens");

  await week(page, "40").scrollIntoViewIfNeeded();
  await expect(week(page, "40")).toContainText("Due date");
  await page.getByRole("button", { name: "Today" }).click();
  await expect(week(page, "28")).toBeInViewport();

  await week(page, "32").getByRole("link").click();
  await expect(page).toHaveURL(/\/\?at=32$/);
  await expect(page.getByRole("heading", { level: 1, name: "In 4 weeks Week 32" })).toBeVisible();
});

test("an own task is added in the Planner, and lands on its week", async ({ page, open }) => {
  await open("/planner");
  await page.getByRole("textbox", { name: "New task for Week 28" }).fill("Pack the snacks for the hospital");
  await page.getByRole("button", { name: "Add task" }).click();
  const task = page.getByRole("checkbox", { name: "Pack the snacks for the hospital" });
  await expect(task).toBeVisible();
  // The tick shows at once; reload only once it's saved.
  const saved = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/api/rpc/"));
  await task.click();
  // Ticked this visit, it stays where it was; on the next, it's done.
  await expect(task).toBeChecked();
  await saved;
  await page.reload({ waitUntil: "networkidle" });
  await expect(task).toBeHidden();
  await page.getByRole("button", { name: /^Done/ }).click();
  await expect(task).toBeChecked();

  await open("/timeline");
  await expect(week(page, "28")).toContainText(/✓ \d+ done/);
});

test("Why goes from a task to the item that explains it, and on to its week", async ({ page, open }) => {
  await open("/planner");
  await page.getByRole("link", { name: "Why: Book the RSV vaccine" }).click();
  await expect(page).toHaveURL(/\/library\/rsv-vaccine$/);
  await expect(page.getByRole("heading", { level: 1, name: "The RSV vaccine" })).toBeAttached();

  await page.getByRole("link", { name: "See week 28 on the timeline" }).click();
  await expect(week(page, "28")).toBeInViewport();
});

test("an item is drawn by its type: a verdict, triage with the call to make, a definition, a card", async ({ page, open }) => {
  await open("/library/soft-cheese");
  await expect(page.getByRole("heading", { level: 1, name: "Soft cheese" })).toBeVisible();
  await expect(page.getByText("Avoid", { exact: true })).toBeVisible();
  await page
    .getByRole("region", { name: "Related" })
    .getByRole("link", { name: /Listeria/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/library\/listeria-foods$/);

  // A symptom: when to get help comes first, most urgent first, each with what to do in one tap.
  await open("/library/dizziness-and-fainting");
  const help = page.getByRole("region", { name: "When to get help" });
  await expect(help.getByRole("heading", { level: 3 })).toHaveText([
    "Call 000 or go to emergency",
    "Contact your hospital now",
    "See your doctor or midwife",
    "Mention it at your next visit",
  ]);
  await expect(help.getByRole("link", { name: "Call 000" })).toHaveAttribute("href", "tel:000");
  await expect(help.getByRole("link", { name: "Add your birth suite's number to Emergency info" })).toBeVisible();
  // Any number in a body is one you can tap.
  await expect(help.getByRole("link", { name: "1800 882 436" })).toHaveAttribute("href", "tel:1800882436");

  await open("/library/blood-group-and-antibodies");
  await expect(page.getByText("Glossary")).toBeVisible();
  await expect(page.getByText(/^Also called blood type/)).toBeVisible();

  await open("/library/card-sterile-water");
  // Its label, and the way back to its door.
  await expect(page.getByText("Nobody tells you", { exact: true })).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Nobody tells you" })).toHaveAttribute("href", /door=surprises/);
});

test("the Library finds things, names first", async ({ page, open }) => {
  await open("/library");
  await page.getByLabel("Search the library").fill("whooping cough");
  await expect(page).toHaveURL(/q=whooping/);
  const results = page.getByRole("region", { name: "Results" });
  await expect(results.getByRole("link").first()).toContainText("whooping cough");
  await expect(results.getByRole("link", { name: /The whooping cough vaccine/ })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Ways in" })).toBeHidden();
});

test("the Library's home lists no entries: its doors, what's open right now, and its topics", async ({ page, open }) => {
  await open("/library");
  const doors = page.getByRole("navigation", { name: "Ways in" });
  await expect(doors.getByRole("link")).toHaveCount(8);
  await expect(page.getByRole("region", { name: "Browse by topic" }).getByRole("link", { name: /Food/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /When it's hard/ })).toBeVisible();

  // At week 28: what closes this week leads, the glucose test among it; the RSV vaccine's window has just opened, further down.
  const rightNow = page.getByRole("region", { name: "Right now, at week 28" });
  await expect(rightNow.getByRole("link").first()).toContainText("Closes this week");
  await expect(rightNow.getByRole("link", { name: /The glucose tolerance test/ })).toContainText("Closes this week");
  await rightNow.getByRole("button", { name: /Show all/ }).click();
  await expect(rightNow.getByRole("link", { name: /The RSV vaccine/ })).toContainText("Opened this week");
});

test("can I…? narrows by topic and answer, and an entry leads back to its door", async ({ page, open }) => {
  await open("/library");
  await page
    .getByRole("navigation", { name: "Ways in" })
    .getByRole("link", { name: /Can I…\?/ })
    .click();
  await expect(page).toHaveURL(/door=can-i/);
  await expect(page.getByRole("heading", { level: 1, name: "Can I…?" })).toBeVisible();

  await page.getByRole("navigation", { name: "Topic" }).getByRole("link", { name: /Food/ }).click();
  await expect(page).toHaveURL(/topic=food/);
  await page.getByRole("navigation", { name: "Answer" }).getByRole("link", { name: /Avoid/ }).click();
  await expect(page).toHaveURL(/verdict=avoid/);
  const cheese = page.getByRole("link", { name: /Soft cheese/ });
  await expect(cheese).toContainText("Avoid");
  await expect(page.getByRole("listitem").getByRole("link", { name: /With limits/ })).toHaveCount(0);

  await cheese.click();
  await expect(page).toHaveURL(/\/library\/soft-cheese$/);
  await page.getByRole("link", { name: "Can I…?" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Can I…?" })).toBeVisible();
});

test("is this normal? says when not to wait before anything else", async ({ page, open }) => {
  await open("/library?door=normal");
  await expect(page.getByRole("complementary", { name: "Worried now?" }).getByRole("link", { name: "Call 000" })).toHaveAttribute("href", "tel:000");
  await expect(page.getByRole("region", { name: "Know these first" }).getByRole("link", { name: /Pain in your belly/ })).toBeVisible();
});

test("the glossary opens a word in place", async ({ page, open }) => {
  await open("/library?door=glossary");
  const link = page.getByRole("link", { name: "Read more about CTG monitoring" });
  await expect(link).toBeHidden();
  await page.getByText("CTG monitoring", { exact: true }).click();
  await expect(page.getByText(/^A CTG \(cardiotocograph\) uses two sensors/)).toBeVisible();
  await expect(link).toBeVisible();
});

test("a topic on its own, by door, and for the partner", async ({ page, open }) => {
  await open("/library?topic=food");
  await expect(page.getByRole("heading", { level: 1, name: "Food" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Can I…?" }).getByRole("link", { name: /Soft cheese/ })).toBeVisible();

  await open("/library?door=guides");
  await page.getByRole("link", { name: "For the partner" }).click();
  await expect(page).toHaveURL(/for=partner/);
  await expect(page.getByRole("link", { name: "For the partner" })).toHaveAttribute("aria-current", "page");
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
  await expect(page.getByRole("region", { name: "Asked this week" }).getByText("Emergency, then the lift to level 3.")).toBeVisible();
  await open("/timeline");
  await expect(week(page, "28")).toContainText("1 question asked");
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
  await expect(page.getByRole("heading", { level: 1, name: "Timeline" })).toBeVisible();
  expect(await theme()).toBe("baby-blue");

  await open("/settings");
  await page.getByRole("radio", { name: "Don't know / surprise" }).click();
  await expect.poll(theme).toBe("baby-purple");
});

test("a phone in dark mode opens dark, and the switch on this phone keeps its choice", async ({ page }) => {
  const mode = () => page.evaluate(() => document.documentElement.dataset.theme);
  const page_ = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.emulateMedia({ colorScheme: "dark" });

  // Dark before anything is drawn: the shell's boot script paints it, not the app.
  await page.goto("/settings", { waitUntil: "domcontentloaded" });
  expect(await mode()).toBe("dark");
  await page.waitForLoadState("networkidle");
  expect(await page_()).toBe("rgb(21, 19, 24)");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#151318");

  // Chosen by hand, it holds against the phone, and over a reload.
  await page.getByRole("radio", { name: "Light" }).click();
  await expect.poll(mode).toBe("light");
  await page.reload({ waitUntil: "domcontentloaded" });
  expect(await mode()).toBe("light");
  await page.waitForLoadState("networkidle");

  // The palette still follows the baby in the dark.
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect.poll(mode).toBe("dark");
  await page.getByRole("radio", { name: "Boy" }).click();
  await expect.poll(page_).toBe("rgb(15, 20, 25)");
  await page.getByRole("radio", { name: "Don't know / surprise" }).click();
  await expect.poll(page_).toBe("rgb(21, 19, 24)");

  await page.getByRole("radio", { name: "System" }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(mode).toBe("light");
});

test("an answer in settings tailors an item, and clearing it puts it back", async ({ page, open }) => {
  const rsv = page.locator("#item-rsv-vaccine");

  // Unanswered: the body reads for public care.
  await open("/library/rsv-vaccine");
  await expect(rsv.getByText("Ask at your next appointment where yours is done.")).toBeVisible();

  const coverQuestion = "Do you have private hospital cover that includes pregnancy and birth?";
  const coverRow = page.getByRole("button", { name: new RegExp(`^${coverQuestion.replace("?", "\\?")}`) });
  await open("/settings");
  await expect(coverRow).toContainText("Not answered");
  await coverRow.click();
  await page.getByRole("radiogroup", { name: coverQuestion }).getByRole("radio", { name: "Yes" }).click();
  const clearCover = page.getByRole("button", { name: "Clear answer: Do you have private hospital cover that includes pregnancy and birth?" });
  await expect(clearCover).toBeVisible();

  // Private cover: the RSV item speaks to an obstetrician.
  await open("/library/rsv-vaccine");
  await expect(rsv.getByText("Seeing a private obstetrician?")).toBeVisible();
  await expect(rsv.getByText("Ask at your next appointment where yours is done.")).toHaveCount(0);

  // A link can open settings at a question.
  await open("/settings?ask=cover");
  await expect(coverRow).toHaveAttribute("aria-expanded", "true");
  await expect(coverRow).toContainText("Yes");
  await clearCover.click();
  await expect(coverRow).toContainText("Not answered");
  await open("/library/rsv-vaccine");
  await expect(rsv.getByText("Ask at your next appointment where yours is done.")).toBeVisible();
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
  // Its item says an answer hid it, and links to that answer.
  await open("/library/childcare-waitlists");
  await page.getByRole("link", { name: "settings", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Will you want childcare in the baby's first two years\?/ })).toHaveAttribute("aria-expanded", "true");

  // Not now puts a question off, without answering it.
  await open("/");
  const rhd = ask.getByRole("group", { name: "Is the pregnant parent's blood group RhD negative?" });
  await rhd.getByRole("button", { name: /^Not now/ }).click();
  await expect(rhd).toHaveCount(0);

  // Settings says who answered, and clearing it puts the plan back.
  await open("/settings");
  const childcareRow = page.getByRole("button", { name: /^Will you want childcare in the baby's first two years\?/ });
  await expect(childcareRow).toContainText(/Jason answered,/);
  await childcareRow.click();
  // It says what it decides.
  await expect(
    page.getByRole("region", { name: "Will you want childcare in the baby's first two years?" }).getByRole("link", { name: /childcare/i })
  ).toBeVisible();
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

test("the Planner starts with one thing to do next, and ticking it brings up the next", async ({ page, open }) => {
  await open("/planner");
  const next = page.getByRole("region", { name: "Next up" });
  // The same order as This week: at 28+0, the glucose test's deadline leads.
  await expect(next.getByRole("checkbox")).toHaveAccessibleName("Book the glucose tolerance test");
  await expect(page.getByText(/^\d+ of \d+ done · 2 deadlines close$/)).toBeVisible();
  // What's ahead is in stages, each folded away until asked for.
  const horizon = page.getByRole("region", { name: "On the horizon" });
  const fullTerm = horizon.getByRole("button", { name: /^By full term/ });
  await expect(fullTerm).toContainText(/\d of \d+ done/);
  await expect(page.getByRole("checkbox", { name: "Pack the hospital bag" })).toHaveCount(0);
  await fullTerm.click();
  await expect(page.getByRole("checkbox", { name: "Pack the hospital bag" })).toBeVisible();

  await next.getByRole("checkbox").click();
  await expect(next.getByRole("checkbox")).toHaveAccessibleName("Give your employer written notice of parental leave");
  // Put it back for the journeys after this one.
  await page.getByRole("button", { name: /^Done/ }).click();
  await page.getByRole("checkbox", { name: "Book the glucose tolerance test" }).click();
  await expect(next.getByRole("checkbox")).toHaveAccessibleName("Book the glucose tolerance test");
});

test("This week peeks ahead at the next week, and comes back", async ({ page, open }) => {
  await open("/");
  const weeks = page.getByRole("navigation", { name: "Weeks" });
  await weeks.getByRole("link", { name: "Week 29" }).click();
  await expect(page).toHaveURL(/\/\?at=29$/);
  await expect(page.getByRole("heading", { level: 1, name: "Next week Week 29" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Best done that week" })).toBeVisible();
  // What to do now stays with now.
  await expect(page.getByRole("region", { name: "To do now" })).toHaveCount(0);

  await weeks.getByRole("link", { name: "Week 30" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "In 2 weeks Week 30" })).toBeVisible();
  await weeks.getByRole("link", { name: "Back to this week" }).click();
  await expect(page).toHaveURL((url) => url.pathname === "/" && url.search === "");
  await expect(page.getByRole("heading", { level: 1, name: "This week Week 28" })).toBeVisible();
  await expect(page.getByRole("region", { name: "To do now" })).toBeVisible();
});

test("an item draws its window against today, and offers its questions", async ({ page, open }) => {
  await open("/library/rsv-vaccine");
  const rsv = page.locator("#item-rsv-vaccine");
  await expect(rsv.getByRole("figure", { name: /Weeks 28 to 36/ })).toBeVisible();
  await expect(rsv.getByText("Open now · 8 weeks left")).toBeVisible();

  const text = "If the baby comes within 2 weeks of the vaccine, will they need the infant antibody?";
  await rsv.getByRole("button", { name: `Add to your questions: ${text}` }).click();
  await expect(rsv.getByText("On your list").first()).toBeVisible();

  await open("/planner");
  await expect(page.getByText(text)).toBeVisible();
});

test("an extra is off until one of you turns it on, then it's everywhere it belongs", async ({ page, open }) => {
  const hostTask = page.getByRole("checkbox", { name: "Decide who's hosting the shower, and pick a date" });
  await open("/planner");
  await expect(page.getByRole("heading", { level: 1, name: "Planner" })).toBeVisible();
  await expect(hostTask).toHaveCount(0);

  // Its item says why it isn't there, and links to its switch.
  await open("/library/baby-shower");
  await expect(page.getByText("It's part of Baby shower, an extra that's off.")).toBeVisible();
  await page.getByRole("link", { name: "Turn it on in settings" }).click();
  const shower = page.getByRole("switch", { name: "Baby shower" });
  await expect(shower).not.toBeChecked();
  await shower.click();
  await expect(shower).toBeChecked();
  await expect(page.getByText(/^Jason turned it on,/)).toBeVisible();

  await open("/planner");
  await expect(hostTask).toBeVisible();
  await open("/library/baby-shower");
  await expect(page.getByRole("heading", { level: 1, name: "The baby shower" })).toBeAttached();

  // Off means gone.
  await open("/settings");
  await page.getByRole("switch", { name: "Baby shower" }).click();
  await expect(page.getByRole("switch", { name: "Baby shower" })).not.toBeChecked();
  await open("/planner");
  await expect(page.getByRole("heading", { level: 1, name: "Planner" })).toBeVisible();
  await expect(hostTask).toHaveCount(0);
});

test("This week offers an extra nobody has decided on, once", async ({ page, open }) => {
  // At 28+0, onboarding's extras were skipped: the first whose week has come is offered.
  await open("/");
  const offer = page.getByRole("region", { name: "Add food and drink?" });
  await expect(offer).toBeVisible();
  await offer.getByRole("button", { name: "Add it" }).click();
  await expect(offer).toHaveCount(0);
  // The next one takes its place.
  const next = page.getByRole("region", { name: "Add telling people?" });
  await next.getByRole("button", { name: "No thanks" }).click();
  await expect(next).toHaveCount(0);

  await open("/library/listeria");
  await expect(page.getByRole("heading", { level: 1, name: "Listeria and the foods that carry it" })).toBeAttached();
  await open("/settings");
  await expect(page.getByRole("switch", { name: "Food and drink" })).toBeChecked();
  await expect(page.getByRole("switch", { name: "Telling people" })).not.toBeChecked();
});

test("the names game: a name is a match only when you both like it, on your own phones", async ({ page, open, browser }) => {
  // It comes with the Choosing a name extra.
  await open("/drawer");
  await page.getByRole("link", { name: "Turn it on in settings" }).click();
  await page.getByRole("switch", { name: "Choosing a name" }).click();
  await expect(page.getByRole("switch", { name: "Choosing a name" })).toBeChecked();

  // Jason adds two names: adding one likes it.
  await open("/drawer");
  const names = page.getByRole("region", { name: "Baby names" });
  for (const name of ["ada", "Iris"]) {
    await names.getByRole("textbox", { name: "A name to add" }).fill(name);
    await names.getByRole("button", { name: "Add name" }).click();
    await expect(names.getByRole("textbox", { name: "A name to add" })).toHaveValue("");
  }
  await expect(names.getByRole("heading", { name: "No matches yet" })).toBeVisible();

  // Sam, on another phone, sees the names but not Jason's votes, and likes one.
  const phone = await browser.newContext();
  const sam = await phone.newPage();
  await sam.goto("/login", { waitUntil: "networkidle" });
  await sam.getByLabel("Password").fill(PASSWORD);
  await sam.getByRole("button", { name: "Log in" }).click();
  await sam.waitForURL((url) => url.pathname !== "/login");
  await sam.goto("/onboarding", { waitUntil: "networkidle" });
  await sam.getByRole("button", { name: "I'm Sam" }).click();
  await sam.waitForURL((url) => !url.pathname.startsWith("/onboarding"));
  await sam.goto("/drawer", { waitUntil: "networkidle" });
  const samNames = sam.getByRole("region", { name: "Baby names" });
  await expect(samNames.getByText("2 names to go")).toBeVisible();
  await samNames.getByRole("button", { name: "Pass on Ada" }).click();
  await samNames.getByRole("button", { name: "Like Iris" }).click();
  await expect(samNames.getByRole("region", { name: "Matches" }).getByText("Iris")).toBeVisible();
  await phone.close();

  await open("/drawer");
  const matches = names.getByRole("region", { name: "Matches" });
  await expect(matches.getByRole("heading", { name: "You both like one name" })).toBeVisible();
  await expect(matches.getByText("Iris")).toBeVisible();
  await expect(matches.getByText("Ada")).toHaveCount(0);

  // Off means gone.
  await open("/settings");
  await page.getByRole("switch", { name: "Choosing a name" }).click();
  await open("/drawer");
  await expect(page.getByRole("region", { name: "Baby names" })).toHaveCount(0);
});

test("Emergency info: filled in once, it's the call button and the handover in a hurry", async ({ page, open }) => {
  await open("/drawer");
  await page.getByRole("link", { name: /^Emergency info/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Emergency info" })).toBeVisible();
  // Before anything is filled in, 000 is there to call, and the card says what's still blank.
  await expect(page.getByRole("link", { name: "Call 000" })).toHaveAttribute("href", "tel:000");
  await expect(page.getByText(/^Still blank: Full name, Date of birth, Allergies/)).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("textbox", { name: "Birth suite" }).fill("(02) 9999 0000");
  await page.getByRole("textbox", { name: "Allergies" }).fill("Penicillin");
  await page.getByRole("textbox", { name: "Blood group" }).fill("O negative");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("link", { name: "Call the birth suite" })).toHaveAttribute("href", "tel:0299990000");
  const card = page.getByRole("region", { name: "For whoever is treating her" });
  await expect(card.getByText("Penicillin")).toBeVisible();
  await expect(card.getByText("O negative")).toBeVisible();
  await expect(page.getByText(/^Last changed by Jason on/)).toBeVisible();
});

test("opening a choice further down the page keeps your place", async ({ page, open }) => {
  // The design system's Select focused its list before placing it, which scrolled the page to the top
  // (patched in patches/: focus with preventScroll). A design-system upgrade could undo it.
  await open("/settings");
  const row = page.getByRole("button", { name: /^Who's looking after the pregnancy/ });
  await row.click();
  await row.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(200);
  await page.getByRole("combobox", { name: "Who's looking after the pregnancy?" }).click();
  await expect(page.getByRole("listbox")).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await page.keyboard.press("Escape");
});

test("a save further down the page keeps your place, and what you had open", async ({ page, open }) => {
  // A save refetches what's on screen with the page still drawn: it isn't swapped for the loading page,
  // which had scrolled it to the top and closed the open row.
  await open("/settings");
  const shower = page.getByRole("switch", { name: "Baby shower" });
  await shower.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(200);
  await shower.click();
  await expect(page.getByText(/^Jason turned it on,/)).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(before);

  const row = page.getByRole("button", { name: /^Who's looking after the pregnancy/ });
  await row.click();
  await row.scrollIntoViewIfNeeded();
  const at = await page.evaluate(() => window.scrollY);
  await page.getByRole("combobox", { name: "Who's looking after the pregnancy?" }).click();
  await page.getByRole("option").first().click();
  await expect(row).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText(/^Jason answered,/).first()).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(at);

  // As it was, for the specs after.
  await shower.click();
  await expect(shower).not.toBeChecked();
});

test.describe("a save that fails", () => {
  test.use({ allowedErrors: [/Failed to load resource/] });

  test("says so, and leaves things as they were", async ({ page, open }) => {
    await open("/settings");
    await page.route("**/api/rpc/**", (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
    const shower = page.getByRole("switch", { name: "Baby shower" });
    await shower.click();
    await expect(page.getByRole("alert").filter({ hasText: "That didn't save" })).toBeVisible();
    await expect(shower).not.toBeChecked();
  });
});

test.describe("a save after the session ends", () => {
  test.use({ allowedErrors: [/401/] });

  test("goes to log in", async ({ page, open, context }) => {
    await open("/settings");
    await context.clearCookies();
    await page.getByRole("switch", { name: "Baby shower" }).click();
    await page.waitForURL((url) => url.pathname === "/login");
  });
});
