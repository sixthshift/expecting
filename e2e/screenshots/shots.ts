// Sets Expecting up as Sam, 26 weeks along, with Jason joined by invite and a
// few days kept in the Journal, then photographs the pages the README shows:
// four on a phone, one on a desktop.
import { type Browser, type BrowserContextOptions, expect, type Page, test } from "@playwright/test";

const OUT = "docs/screenshots";
const PASSWORD = "screenshots-only";
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };

/** dd, mm, yyyy of today plus `days`, as the date field takes it. */
function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}${d.getFullYear()}`;
}

async function newPhone(browser: Browser, options: BrowserContextOptions = PHONE) {
  const context = await browser.newContext(options);
  return { context, page: await context.newPage() };
}

async function logIn(page: Page, name: string) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: `I'm ${name}` }).click();
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL((url) => url.pathname !== "/login");
}

/** Open `path`, let it settle, and keep the screen as `name`, scrolled to the region `at` if given. */
async function shoot(page: Page, path: string, name: string, at?: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  await expect(page.locator("h1").first()).toBeVisible();
  if (at) await page.getByRole("region", { name: at }).evaluate((el) => el.scrollIntoView({ block: "start" }));
  // Let entrances and images finish.
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

async function add(page: Page, choice: string) {
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: choice }).click();
}

test.describe.configure({ mode: "serial" });

test("set up: Sam at 26 weeks, Jason by invite, a few days kept", async ({ browser }) => {
  const { context, page } = await newPhone(browser);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "I'm the one who's pregnant (or will be)" }).click();
  await page.getByLabel("Your name").fill("Sam");
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("The same again").fill(PASSWORD);
  await page.getByRole("button", { name: "Set up Expecting" }).click();

  // 14 weeks to go is 26+0.
  await expect(page.getByRole("heading", { name: "When's the baby due?" })).toBeVisible();
  await page.getByRole("spinbutton", { name: /day/i }).click();
  await page.keyboard.type(daysFromToday(14 * 7));
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Don't know / surprise" }).click();
  const allSet = page.getByRole("heading", { name: "You're all set" });
  const skip = page.getByRole("button", { name: "Skip for now" });
  while (!(await allSet.isVisible())) {
    const question = await page.getByRole("heading", { level: 1 }).textContent();
    await skip.click();
    await expect(page.getByRole("heading", { level: 1, name: question ?? "" })).toBeHidden();
    await expect(allSet.or(skip)).toBeVisible();
  }
  await page.getByRole("button", { name: "Open Expecting" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Week 26/ })).toBeVisible();

  // Jason joins by Sam's invite.
  await page.goto("/settings", { waitUntil: "networkidle" });
  const account = page.getByRole("region", { name: "Account" });
  await account.getByRole("button", { name: "Invite the partner" }).click();
  const link = await account.locator("code").textContent();
  const jason = await newPhone(browser);
  await jason.page.goto(link!, { waitUntil: "networkidle" });
  await jason.page.getByLabel("Your name").fill("Jason");
  await jason.page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await jason.page.getByLabel("The same again").fill(PASSWORD);
  await jason.page.getByRole("button", { name: "Join" }).click();
  await expect(jason.page.getByRole("heading", { level: 1, name: /Week 26/ })).toBeVisible();
  await jason.context.close();

  // A few things kept, so the Journal has a story.
  await page.goto("/journal", { waitUntil: "networkidle" });
  await add(page, "A note");
  await page.getByRole("dialog").getByRole("textbox", { name: "New note" }).fill("Told the team at work today. Everyone had a story about their own.");
  await page.getByRole("dialog").getByRole("button", { name: "Keep it" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await add(page, "The baby moved");
  await page.getByRole("textbox", { name: "About the movement" }).fill("Hiccups after dinner, again");
  await page.getByRole("button", { name: "Keep it" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.goto("/", { waitUntil: "networkidle" });
  const checkIn = page.getByRole("region", { name: "How are you today, Sam?" });
  await checkIn.getByText("Good", { exact: true }).click();
  await checkIn.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("heading", { name: "Good today" })).toBeVisible();
  // A couple keeping up: what was due before they started is done.
  for (const task of ["Book antenatal classes", "Shortlist childcare centres and join their waiting lists"]) {
    await page.getByRole("checkbox", { name: task }).first().click();
    await expect(page.getByRole("checkbox", { name: task })).toHaveCount(0);
  }
  // Let every save reach the server before this phone goes.
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("expecting-outbox") ?? "[]").length)).toBe(0);
  await context.close();
});

test("the phone: Home, the Planner, a Library entry, the Journal", async ({ browser }) => {
  const { context, page } = await newPhone(browser);
  await logIn(page, "Sam");
  await shoot(page, "/", "this-week");
  await shoot(page, "/planner", "planner");
  await shoot(page, "/library/soft-cheese", "library");
  await shoot(page, "/journal", "journal", "This week");
  await context.close();
});

test("the desktop: Home", async ({ browser }) => {
  const { context, page } = await newPhone(browser, DESKTOP);
  await logIn(page, "Sam");
  await shoot(page, "/", "desktop");
  await context.close();
});
