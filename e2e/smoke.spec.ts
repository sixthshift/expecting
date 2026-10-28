// Every page, loaded cold in the built app, renders its heading and logs no
// error. A page that throws as its bundle loads fails here and nowhere else.
// Runs at phone and desktop size (playwright.config.ts).
import { expect, test } from "./fixtures";

const pages = [
  { path: "/", heading: "Timeline" },
  { path: "/?at=pp3", heading: "Timeline" },
  { path: "/library", heading: "Library" },
  { path: "/library/rsv-vaccine", heading: "The RSV vaccine" },
  { path: "/planner", heading: "Planner" },
  { path: "/journal", heading: "Journal" },
  { path: "/toolkit", heading: "Toolkit" },
  { path: "/settings", heading: "Settings" },
];

for (const { path, heading } of pages) {
  test(`${path} loads`, async ({ page, open }) => {
    await open(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeAttached();
    if (heading === "Timeline") await expect(page.getByRole("slider", { name: "Timeline" })).toBeVisible();
  });
}

test("every pillar and settings is reachable", async ({ page, open }) => {
  await open("/");
  const nav = page.getByRole("navigation", { name: "Expecting" });
  for (const name of ["Library", "Planner", "Journal", "Toolkit", "Timeline"]) {
    await nav.getByRole("link", { name }).click();
    await expect(nav.getByRole("link", { name })).toHaveAttribute("aria-current", "page");
  }
  await expect(page.getByRole("slider", { name: "Timeline" })).toBeVisible();
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
});

test.describe("a page that doesn't exist", () => {
  test.use({ allowedErrors: [/404|Not Found/i] });
  test("is not found", async ({ page, open }) => {
    await open("/weeks");
    await expect(page.getByRole("heading", { level: 1, name: "Not here" })).toBeVisible();
  });
});

test("/api/health answers", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject({ ok: true });
});

test.describe("logged out", () => {
  test.use({ loggedIn: false });

  test("a page sends you to log in, then to say who you are", async ({ page, open }) => {
    await open("/settings");
    await expect(page).toHaveURL(/\/login\?next=%2Fsettings$/);

    await page.getByLabel("Password").fill("not it");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("That's not the password.")).toBeVisible();

    await page.getByLabel("Password").fill("e2e-household-password");
    await page.getByRole("button", { name: "Log in" }).click();
    // A phone that hasn't said who's holding it is asked first, then goes on.
    await page.getByRole("button", { name: "I'm Jason" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Timeline" })).toBeAttached();
  });
});

test("server functions refuse a caller without a session", async ({ page, open, playwright, baseURL }) => {
  // Note the calls a logged-in page makes, then make them again with no cookie.
  const calls: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/_serverFn/")) calls.push(request.url());
  });
  await open("/");
  expect(calls.length, "the app loaded through server functions").toBeGreaterThan(0);

  const stranger = await playwright.request.newContext({ baseURL });
  for (const url of calls) {
    const response = await stranger.get(url, { headers: { accept: "application/json" } });
    expect(response.status(), url).toBe(401);
  }
  await stranger.dispose();
});

test("logging out ends the session", async ({ page, open }) => {
  await open("/settings");
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await open("/settings");
  await expect(page).toHaveURL(/\/login\?next=%2Fsettings$/);
});
