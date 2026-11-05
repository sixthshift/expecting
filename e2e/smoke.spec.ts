// Every page, loaded cold in the built app, renders its heading and logs no
// error. A page that throws as its bundle loads fails here and nowhere else.
// Runs at phone and desktop size (playwright.config.ts).
import { expect, test } from "./fixtures";
import { PASSWORDS } from "./playwright.config";

const pages = [
  { path: "/", heading: "This week" },
  { path: "/timeline?at=36", heading: "The whole pregnancy" },
  { path: "/planner/weeks?stage=37", heading: "Across the weeks" },
  { path: "/library", heading: "Library" },
  { path: "/library/rsv-vaccine", heading: "The RSV vaccine" },
  { path: "/planner", heading: "Planner" },
  { path: "/journal", heading: "Journal" },
  { path: "/drawer", heading: "Drawer" },
  { path: "/drawer/names", heading: "Baby names" },
  { path: "/drawer/people", heading: "Your people" },
  { path: "/drawer/jobs", heading: "Who does what" },
  { path: "/drawer/bingo", heading: "Pregnancy bingo" },
  { path: "/emergency", heading: "Emergency info" },
  // Settings opens on its first section: a desktop's heading is the section's, a phone's the bar's.
  { path: "/settings", heading: /^(Settings|The pregnancy)$/ },
];

for (const { path, heading } of pages) {
  test(`${path} loads`, async ({ page, open }) => {
    await open(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeAttached();
    if (heading === "The whole pregnancy") await expect(page.locator('[data-week="36"]')).toBeVisible();
  });
}

test("every pillar and settings is reachable", async ({ page, open }) => {
  await open("/");
  const nav = page.getByRole("navigation", { name: "Expecting" });
  for (const name of ["Library", "Planner", "Journal", "Drawer", "Home"]) {
    await nav.getByRole("link", { name }).click();
    await expect(nav.getByRole("link", { name })).toHaveAttribute("aria-current", "page");
    // Home is `/`, which every page sits under: it is current only on itself.
    if (name !== "Home") await expect(nav.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  }
  await expect(page.getByRole("heading", { level: 1, name: "This week" })).toBeVisible();
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /^(Settings|The pregnancy)$/ })).toBeVisible();
});

test("the + opens what to add, on a phone above the tab bar and on a desktop in the top bar", async ({ page, open }) => {
  await open("/library");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("button", { name: "A note" })).toBeVisible();
  await sheet.getByRole("button", { name: "Close" }).click();
  await expect(sheet).toBeHidden();
});

test("Emergency info is one tap from every pillar, once", async ({ page, open }) => {
  for (const path of ["/", "/library", "/planner", "/journal", "/drawer"]) {
    await open(path);
    // The call button calls once there's a number; it never doubles as a second way to Emergency info.
    // A call to make (the Journal keeps one on screen for a movement felt as different) has its own way there.
    const frame = page.locator(':not([role="alert"] *)');
    await expect(page.getByRole("link", { name: "Emergency info" }).filter({ visible: true }).and(frame)).toHaveCount(1);
    await expect(page.locator('a[href="/emergency"]').filter({ visible: true }).and(frame)).toHaveCount(1);
  }
});

test("Emergency info says when to call, as well as who", async ({ page, open }, testInfo) => {
  await open("/emergency");
  await expect(page.getByRole("heading", { name: "When to call" })).toBeVisible();
  await expect(page.getByText("Your baby is moving less than usual, or has stopped moving.")).toBeVisible();
  await page.getByRole("link", { name: "All the warning signs, and each in full" }).click();
  // A phone goes to the entry's page; a desktop opens it beside Emergency info, in the side panel.
  const where = testInfo.project.name === "desktop" ? page.getByRole("complementary", { name: "Warning signs" }) : page;
  await expect(where.getByRole("heading", { level: testInfo.project.name === "desktop" ? 2 : 1, name: "Warning signs" })).toBeVisible();
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
    await expect(page.getByRole("link", { name: "Library" }).first()).toBeVisible();
    await page.getByRole("link", { name: "Back home" }).click();
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

  test("a page sends you to log in, as which of you, then on to where it was going", async ({ page, open }) => {
    await open("/settings/account");
    await expect(page).toHaveURL(/\/login\?next=%2Fsettings%2Faccount$/);

    // Each of you by name, and only the two of you: no place to claim.
    await expect(page.getByRole("button", { name: /^I'm / })).toHaveCount(2);
    await page.getByRole("button", { name: "I'm Jason" }).click();
    await page.getByLabel("Password").fill("not it");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("That's not the password.")).toBeVisible();

    // Sam's password is not Jason's. A wrong one empties the field once its answer is in.
    await page.getByLabel("Password").fill(PASSWORDS.Sam);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByLabel("Password")).toHaveValue("");

    await page.getByLabel("Password").fill(PASSWORDS.Jason);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/settings\/account$/);
    await expect(page.getByText("Logged in as Jason.")).toBeVisible();
  });

  test("the login page has the icon, the manifest and the worker", async ({ page, open, request }) => {
    // The icons, the manifest and the worker are served as files ahead of the gate, so a stranger's tab has them too.
    await open("/login");
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.svg");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
    for (const path of [
      "/favicon.svg",
      "/favicon-baby-blue.svg",
      "/favicon-baby-pink.svg",
      "/icon.svg",
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
    // But one: who's here to log in as (getAccess, src/api/rpc/session.ts), which says your names and nothing else.
    if (response.status() === 200) {
      const body = await response.text();
      expect(body, url).toContain("hasPassword");
      expect(body, url).not.toMatch(/dueDate|password_hash|\$argon2/);
      continue;
    }
    expect(response.status(), url).toBe(401);
  }
  await stranger.dispose();
});

test("logging out ends the session", async ({ page, open }) => {
  await open("/settings/account");
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  // It asks first, and Cancel keeps you in.
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await page.getByRole("button", { name: "Yes, log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await open("/settings");
  await expect(page).toHaveURL(/\/login\?next=%2Fsettings$/);
});

test("on a desktop, a Why opens beside the list, in the side panel, and Back and Esc close it", async ({ page, open }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "a phone opens the entry's page");
  await open("/planner");
  await page.getByRole("link", { name: "Why: Book the RSV vaccine" }).click();
  await expect(page).toHaveURL(/\/planner\?panel=item(:|%3A)rsv-vaccine$/);
  const panel = page.getByRole("complementary", { name: "The RSV vaccine" });
  await expect(panel.getByRole("heading", { level: 2, name: "The RSV vaccine" })).toBeVisible();
  // The list is still there, and still the page's.
  await expect(page.getByRole("heading", { level: 1, name: "Planner" })).toBeVisible();
  await page.goBack();
  await expect(panel).toBeHidden();
  await page.goForward();
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(page).toHaveURL(/\/planner$/);
});

test("on a desktop, an entry opened in the Library reads beside the list, on through it, and Back is to the list alone", async ({ page, open }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "a phone opens the entry's page, and swipes");
  await open("/library?door=can-i&topic=food");
  const rows = page.getByRole("region", { name: "Food" }).getByRole("link");
  const [first = "", second = ""] = [await rows.nth(0).innerText(), await rows.nth(1).innerText()].map((t) => t.split("\n")[0] ?? "");
  await rows.nth(0).click();
  await expect(page).toHaveURL(/\/library\?door=can-i&topic=food&entry=[a-z0-9-]+$/);
  const entry = page.getByRole("region", { name: "The entry" });
  await expect(entry.getByRole("heading", { level: 2, name: first })).toBeVisible();
  // The list is still there, the one open marked; the next from it takes its place.
  await expect(rows.nth(0)).toHaveAttribute("aria-current", "page");
  await rows.nth(1).click();
  await expect(entry.getByRole("heading", { level: 2, name: second })).toBeVisible();
  await page.goBack();
  await expect(entry).toBeHidden();
  await expect(page).toHaveURL(/\/library\?door=can-i&topic=food$/);
  // And on to the entry's own page, the article alone.
  await rows.nth(1).click();
  await entry.getByRole("link", { name: "Open full page" }).click();
  await expect(page.getByRole("heading", { level: 1, name: second })).toBeVisible();
  await expect(page.getByRole("region", { name: "The entry" })).toBeHidden();
});
