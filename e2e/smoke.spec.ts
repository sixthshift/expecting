// Every page, loaded cold in the built app, renders its heading and logs no
// error. A page that throws as its bundle loads fails here and nowhere else.
// A new page adds a row to the list.
import { expect, test } from "./fixtures";

const pages = [
  { path: "/weeks", heading: "Weeks" },
  { path: "/week/before", heading: "Before you start" },
  { path: "/week/28", heading: "Week 28" },
  { path: "/week/pp3", heading: "Week 3 after birth" },
  { path: "/checklist", heading: "Checklist" },
  { path: "/questions", heading: "Questions" },
  { path: "/settings", heading: "Settings" },
];

test("/ loads", async ({ page, open }) => {
  await open("/");
  // "Expecting" before a due date is entered, the current week after.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

for (const { path, heading } of pages) {
  test(`${path} loads`, async ({ page, open }) => {
    await open(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  });
}

test("the main navigation reaches every screen", async ({ page, open }) => {
  await open("/weeks");
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const [link, heading] of [
    ["Checklist", "Checklist"],
    ["Questions", "Questions"],
    ["Settings", "Settings"],
    ["Weeks", "Weeks"],
  ] as const) {
    await nav.getByRole("link", { name: link }).click();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(nav.getByRole("link", { name: link })).toHaveAttribute("aria-current", "page");
  }
});

test.describe("a week that doesn't exist", () => {
  test.use({ allowedErrors: [/404|Not Found/i] });
  test("is not found", async ({ page, open }) => {
    await open("/week/43");
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

  test("a page sends you to log in, then back where you were going", async ({ page, open }) => {
    await open("/checklist");
    await expect(page).toHaveURL(/\/login\?next=%2Fchecklist$/);
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();

    await page.getByLabel("Password").fill("not it");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("That's not the password.")).toBeVisible();

    await page.getByLabel("Password").fill("e2e-household-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Checklist" })).toBeVisible();
  });

  test("server functions refuse without a session", async ({ request }) => {
    const response = await request.get("/_serverFn/anything", { headers: { accept: "application/json" } });
    expect(response.status()).toBe(401);
  });
});
