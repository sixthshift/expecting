// What every spec imports in place of @playwright/test. Its `page` fails the
// test on any uncaught error or console error, so every journey is also a
// check that nothing on its way threw — the failure the unit suite cannot see.
// A test that expects one (a 404 it asked for) names it in `allowedErrors`.
//
// Every page starts logged in, through the same form a phone uses. A test
// about logging in opts out with `loggedIn: false`.
import { test as base, expect } from "@playwright/test";
import { PASSWORD } from "./playwright.config";

type Fixtures = {
  /** Patterns of page errors this test expects; any other fails it. */
  allowedErrors: RegExp[];
  /** Whether the page starts with a session. Default true. */
  loggedIn: boolean;
  /** Go to `path` and resolve once the page has loaded and settled. */
  open: (path: string) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  allowedErrors: [[], { option: true }],
  loggedIn: [true, { option: true }],
  page: async ({ page, allowedErrors, loggedIn }, use) => {
    if (loggedIn) {
      // page.request shares the browser context's cookies, so the session lands where the page will use it.
      const response = await page.request.post("/api/login", { form: { password: PASSWORD }, maxRedirects: 0 });
      expect(response.status(), "logging in").toBe(303);
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
    expect(errors, "the page logged errors").toEqual([]);
  },
  // The server sends the shell and the browser draws the page once the
  // route's chunk arrives. A quiet network means it is in.
  open: async ({ page }, use) => {
    await use(async (path) => {
      await page.goto(path, { waitUntil: "networkidle" });
    });
  },
});

export { expect };
