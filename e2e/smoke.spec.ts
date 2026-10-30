// Every page, loaded cold in the built app, renders its heading and logs no
// error. A page that throws as its bundle loads fails here and nowhere else.
// Runs at phone and desktop size (playwright.config.ts).
import { expect, test } from "./fixtures";

const pages = [
  { path: "/", heading: "This week" },
  { path: "/timeline?at=36", heading: "Timeline" },
  { path: "/library", heading: "Library" },
  { path: "/library/rsv-vaccine", heading: "The RSV vaccine" },
  { path: "/planner", heading: "Planner" },
  { path: "/journal", heading: "Journal" },
  { path: "/drawer", heading: "Drawer" },
  { path: "/emergency", heading: "Emergency info" },
  { path: "/settings", heading: "Settings" },
];

for (const { path, heading } of pages) {
  test(`${path} loads`, async ({ page, open }) => {
    await open(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeAttached();
    if (heading === "Timeline") await expect(page.locator('[data-week="36"]')).toBeVisible();
  });
}

test("every pillar and settings is reachable", async ({ page, open }) => {
  await open("/");
  const nav = page.getByRole("navigation", { name: "Expecting" });
  for (const name of ["Timeline", "Library", "Planner", "Journal", "Drawer", "This week"]) {
    await nav.getByRole("link", { name }).click();
    await expect(nav.getByRole("link", { name })).toHaveAttribute("aria-current", "page");
    // Home is `/`, which every page sits under: it is current only on itself.
    if (name !== "This week") await expect(nav.getByRole("link", { name: "This week" })).not.toHaveAttribute("aria-current");
  }
  await expect(page.getByRole("heading", { level: 1, name: "This week" })).toBeVisible();
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
});

test("the + opens what to add, on a phone above the tab bar and on a desktop in the sidebar", async ({ page, open }) => {
  await open("/timeline");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("button", { name: "A note" })).toBeVisible();
  await sheet.getByRole("button", { name: "Close" }).click();
  await expect(sheet).toBeHidden();
});

test("Emergency info is one tap from every pillar, once", async ({ page, open }) => {
  for (const path of ["/", "/timeline", "/library", "/planner", "/journal", "/drawer"]) {
    await open(path);
    // The call button calls once there's a number; it never doubles as a second way to Emergency info.
    // A call to make (the Journal keeps one on screen for a movement felt as different) has its own way there.
    const frame = page.locator(':not([role="alert"] *)');
    await expect(page.getByRole("link", { name: "Emergency info" }).filter({ visible: true }).and(frame)).toHaveCount(1);
    await expect(page.locator('a[href="/emergency"]').filter({ visible: true }).and(frame)).toHaveCount(1);
  }
});

test("Emergency info says when to call, as well as who", async ({ page, open }) => {
  await open("/emergency");
  await expect(page.getByRole("heading", { name: "When to call" })).toBeVisible();
  await expect(page.getByText("Your baby is moving less than usual, or has stopped moving.")).toBeVisible();
  await page.getByRole("link", { name: "All the warning signs, and each in full" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Warning signs" })).toBeVisible();
});

test("a week shows its note, read as the partner holding this phone, or as the other", async ({ page, open }) => {
  await open("/?at=20");
  const note = page.getByRole("article", { name: "Halfway" });
  await expect(note).toBeVisible();
  for (const part of ["The baby", "For the partner"]) await expect(note.getByRole("heading", { name: part })).toBeVisible();
  await note.getByRole("radio", { name: /^For (Sam|the pregnancy)$/ }).click();
  for (const part of ["The baby", "Your body"]) await expect(note.getByRole("heading", { name: part })).toBeVisible();
});

test.describe("a page that doesn't exist", () => {
  test.use({ allowedErrors: [/404|Not Found/i] });
  test("is not found, in the frame, looking for what was meant", async ({ page, open }) => {
    await open("/library/iron-tablets");
    await expect(page.getByRole("heading", { level: 1, name: "Not in the Library" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Search the library" })).toHaveValue("iron tablets");
    await page.getByRole("link", { name: /^Iron tablets/ }).click();
    await expect(page).toHaveURL(/\/library\/iron$/);
  });

  test("any other address keeps the pillars", async ({ page, open }) => {
    await open("/weeks");
    await expect(page.getByRole("heading", { level: 1, name: "Nothing at this address" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Timeline" }).first()).toBeVisible();
    await page.getByRole("link", { name: "Back to This week" }).click();
    await expect(page).toHaveURL(/\/$/);
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

    await page.getByLabel("Password").fill("e2e-password");
    await page.getByRole("button", { name: "Log in" }).click();
    // A phone that hasn't said who's holding it is asked first, then goes on.
    await page.getByRole("button", { name: "I'm Jason" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "This week" })).toBeAttached();
  });

  test("the login page has the icon, the manifest and the worker", async ({ page, open, request }) => {
    // The icons, the manifest and the worker are served as files ahead of the gate, so a stranger's tab has them too.
    await open("/login");
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.svg");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
    for (const path of [
      "/favicon.svg",
      "/apple-touch-icon.png",
      "/manifest.webmanifest",
      "/icon-192.png",
      "/icon-512.png",
      "/icon-maskable-512.png",
      "/sw.js",
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
    }
  });
});

test("server functions refuse a caller without a session", async ({ page, open, playwright, baseURL }) => {
  // Note the calls a logged-in page makes, then make them again with no cookie.
  const calls: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/rpc/")) calls.push(request.url());
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
  // It asks first, and Cancel keeps you in.
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("button", { name: "Log out" }).click();
  await page.getByRole("button", { name: "Yes, log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await open("/settings");
  await expect(page).toHaveURL(/\/login\?next=%2Fsettings$/);
});
