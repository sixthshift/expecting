// What every spec imports in place of @playwright/test. Its `page` fails the
// test on any uncaught error or console error, so every journey is also a
// check that nothing on its way threw — the failure the unit suite cannot see.
// A test that expects one (a 404 it asked for) names it in `allowedErrors`.
//
// Every page starts logged in, through the same form a phone uses. A test
// about logging in opts out with `loggedIn: false`.
//
// The form is filled once per worker, not once per test: the session cookie it
// sets, and the cookie saying who's holding the phone, are kept and handed to
// each new browser after. Every test is still a new phone, with nothing else
// carried over. A test that ends its session (logging out, clearing cookies)
// leaves no session to keep, so the next test logs in through the form again.
import { type BrowserContext, test as base, type Cookie, expect, type Page } from "@playwright/test";
import { PASSWORD } from "./playwright.config";

type Fixtures = {
  /** Patterns of page errors this test expects; any other fails it. */
  allowedErrors: RegExp[];
  /** Whether the page starts with a session. Default true. */
  loggedIn: boolean;
  /** Who this phone says it is, chosen on the first-run screen once there are any. Null to leave it unsaid. */
  person: string | null;
  /** Go to `path` and resolve once the page has drawn its heading. */
  open: (path: string) => Promise<void>;
};

/** The session cookie the form last set, while it is still live. */
let session: Cookie[] | null = null;
/** The cookie each person's "I'm …" set, by name. */
const people = new Map<string, Cookie[]>();

/** The cookies `context` holds now that it didn't hold in `before`. */
async function added(context: BrowserContext, before: Cookie[]): Promise<Cookie[]> {
  const names = new Set(before.map((cookie) => cookie.name));
  return (await context.cookies()).filter((cookie) => !names.has(cookie.name));
}

export const test = base.extend<Fixtures>({
  allowedErrors: [[], { option: true }],
  loggedIn: [true, { option: true }],
  person: ["Jason", { option: true }],
  page: async ({ page, context, allowedErrors, loggedIn, person }, use) => {
    if (loggedIn && session) await context.addCookies(session);
    else if (loggedIn) {
      await page.goto("/login");
      await page.getByLabel("Password").fill(PASSWORD);
      await page.getByRole("button", { name: "Log in" }).click();
      await page.waitForURL((url) => url.pathname !== "/login");
      session = await added(context, []);
    }
    const held = person && people.get(person);
    if (loggedIn && held) await context.addCookies(held);
    else if (loggedIn && person) {
      // Every test is a new phone: say who's holding it, the way the second parent would.
      const before = await context.cookies();
      await page.goto("/onboarding");
      await page.getByRole("button", { name: `I'm ${person}` }).click();
      await page.waitForURL((url) => !url.pathname.startsWith("/onboarding"));
      people.set(person, await added(context, before));
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
    const kept = await context.cookies();
    if (session && !session.every((cookie) => kept.some((k) => k.name === cookie.name && k.value === cookie.value))) session = null;
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

/** How many saves this page's outbox holds, not yet sent (src/app/model/outboxStore.ts). */
export function waitingSaves(page: Page): Promise<number> {
  return page.evaluate(() => (JSON.parse(localStorage.getItem("expecting-outbox") ?? "[]") as unknown[]).length);
}

export { expect };
