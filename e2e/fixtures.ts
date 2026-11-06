// What every spec imports in place of @playwright/test. Its `page` fails the
// test on any uncaught error or console error, so every journey is also a
// check that nothing on its way threw — the failure the unit suite cannot see.
// A test that expects one (a 404 it asked for) names it in `allowedErrors`.
//
// Every page starts logged in, as `person` (Jason unless a test says), through
// the same form a phone uses. A test about logging in opts out with
// `loggedIn: false`.
//
// The form is filled once per person per worker, not once per test: the
// session cookie it sets is kept and handed to each new browser after. Every
// test is still a new phone, with nothing else carried over. A test that ends
// its session (logging out, clearing cookies) leaves no session to keep, so
// the next test logs in through the form again.
import { type BrowserContext, test as base, type Cookie, expect, type Page } from "@playwright/test";
import { PASSWORDS } from "./playwright.config";

type Fixtures = {
  /** Patterns of page errors this test expects; any other fails it. */
  allowedErrors: RegExp[];
  /** Whether the page starts with a session. Default true. */
  loggedIn: boolean;
  /** Who this phone is logged in as: Jason, set up by global-setup.ts, or Sam, once she has joined (journey.spec.ts). */
  person: keyof typeof PASSWORDS;
  /** Go to `path` and resolve once the page has drawn its heading. */
  open: (path: string) => Promise<void>;
};

/** The session cookie the form last set for each person, while it is still live. */
const sessions = new Map<string, Cookie[]>();

/** The cookies `context` holds now that it didn't hold in `before`. */
async function added(context: BrowserContext, before: Cookie[]): Promise<Cookie[]> {
  const names = new Set(before.map((cookie) => cookie.name));
  return (await context.cookies()).filter((cookie) => !names.has(cookie.name));
}

/**
 * Log `page` in as `person` through /login: their name, when there are two of
 * you to choose from, then their password. Resolves once it has gone on.
 */
export async function logIn(page: Page, person: keyof typeof PASSWORDS): Promise<void> {
  await page.goto("/login", { waitUntil: "networkidle" });
  const pick = page.getByRole("button", { name: `I'm ${person}` });
  const password = page.getByLabel("Password", { exact: true });
  await expect(pick.or(password)).toBeVisible();
  if (await pick.isVisible()) await pick.click();
  await password.fill(PASSWORDS[person]);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL((url) => url.pathname !== "/login");
}

export const test = base.extend<Fixtures>({
  allowedErrors: [[], { option: true }],
  loggedIn: [true, { option: true }],
  person: ["Jason", { option: true }],
  page: async ({ page, context, allowedErrors, loggedIn, person }, use) => {
    const kept = loggedIn ? sessions.get(person) : undefined;
    if (kept) await context.addCookies(kept);
    else if (loggedIn) {
      await logIn(page, person);
      sessions.set(person, await added(context, []));
    }
    const errors: string[] = [];
    const record = (text: string) => {
      if (!allowedErrors.some((pattern) => pattern.test(text))) errors.push(`${page.url()}: ${text}`);
    };
    page.on("pageerror", (error) => record(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") record(message.text());
    });
    await use(page);
    // A session this test ended (or whose cookie it cleared) is not one to hand on.
    const left = await context.cookies();
    const session = sessions.get(person);
    if (session && !session.every((cookie) => left.some((k) => k.name === cookie.name && k.value === cookie.value))) sessions.delete(person);
    // A save shows at once and is sent behind it (src/app/model/outbox.ts): a phone keeps one still
    // waiting, but this browser goes with the test, so every save gets there first.
    if (!page.isClosed()) await expect.poll(() => waitingSaves(page), { message: "saves still waiting to be sent" }).toBe(0);
    expect(errors, "the page logged errors").toEqual([]);
  },
  // The server sends the shell and the browser draws the page once the
  // route's chunk arrives and its data is in. Every page has one heading, drawn then.
  open: async ({ page }, use) => {
    await use(async (path) => {
      await page.goto(path);
      await expect(page.locator("h1").first()).toBeVisible();
    });
  },
});

/** How many saves this page's outbox holds, not yet sent (src/app/model/outboxStore.ts). None on a page never opened (a test that skipped first), which has no storage to read. */
export function waitingSaves(page: Page): Promise<number> {
  if (!page.url().startsWith("http")) return Promise.resolve(0);
  return page.evaluate(() => (JSON.parse(localStorage.getItem("expecting-outbox") ?? "[]") as unknown[]).length);
}

export { expect };

/** What `bookAhead` books: a question is for an appointment, so the specs that add one need one ahead. */
export const AHEAD = "Antenatal check";

/**
 * An appointment some weeks ahead, booked once in a run (the database is
 * shared by every spec): far enough off that one a spec books nearer is the
 * next. Leaves the page on the Planner's appointments.
 */
export async function bookAhead(page: Page): Promise<void> {
  await page.goto("/planner/appointments");
  const appointments = page.getByRole("region", { name: "Appointments" });
  await expect(appointments).toBeVisible();
  if ((await appointments.getByText(AHEAD).count()) > 0) return;
  await appointments.getByRole("button", { name: "Add appointment" }).click();
  await appointments.getByRole("textbox", { name: "What it is" }).fill(AHEAD);
  await appointments.getByRole("spinbutton", { name: /day/i }).click();
  const d = new Date();
  d.setDate(d.getDate() + 40);
  await page.keyboard.type(`${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}${d.getFullYear()}`);
  await appointments.getByRole("button", { name: "Add appointment" }).click();
  await expect(appointments.getByText(AHEAD)).toBeVisible();
}

/** On a phone, opens one of Home's folds by its title ("To keep", "Today's read") once it's drawn, if it's shut; a desktop draws none (`lg` and up), so it does nothing there. */
export async function unfold(page: Page, title: string): Promise<void> {
  if ((page.viewportSize()?.width ?? 0) >= 1024) return;
  const fold = page.getByRole("button", { name: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`) }).and(page.locator("[aria-expanded]"));
  await expect(fold.first()).toBeVisible();
  if ((await fold.first().getAttribute("aria-expanded")) === "false") await fold.first().click();
}
