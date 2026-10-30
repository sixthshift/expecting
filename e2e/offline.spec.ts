// Offline: once the service worker has the app (src/pwa/worker.js), a phone
// with no connection still opens it, every built-in item reads, and what was
// last fetched is on screen. A save made offline waits on the phone, through
// a reload, and goes once there's a connection (src/app/model/outbox.ts).
// Hospital Wi-Fi is the case.
import { expect, test, waitingSaves } from "./fixtures";

// Offline, a save's request fails, and the browser says so in the console; the save waits.
test.use({ allowedErrors: [/ERR_INTERNET_DISCONNECTED|Failed to fetch/] });

test("the app opens, reads and saves with no connection", async ({ page, context, open }) => {
  await open("/");
  // The worker controls the page, and has fetched the items' pages after the app.
  await page.waitForFunction(
    async () => {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active || !navigator.serviceWorker.controller) return false;
      const names = await caches.keys();
      const app = names.find((name) => name.startsWith("expecting-app-"));
      return app ? (await (await caches.open(app)).keys()).length > 900 : false;
    },
    undefined,
    { timeout: 60_000, polling: 500 }
  );
  // Through the worker now, so the data it keeps is this page's.
  await page.reload({ waitUntil: "networkidle" });
  await open("/planner");

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Planner" })).toBeVisible();
  await page.getByRole("navigation", { name: "Expecting" }).getByRole("link", { name: "This week" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "This week" })).toBeVisible();
  // An item never opened before: its page came with the app.
  await page.goto("/library/rsv-vaccine");
  await expect(page.getByRole("heading", { level: 1, name: "The RSV vaccine" })).toBeVisible();

  // A save waits for a connection: it shows at once, and outlasts closing the app.
  await open("/planner");
  const name = (await page.getByRole("checkbox").first().ariaSnapshot()).match(/checkbox "(.+)"/)![1]!;
  const tick = page.getByRole("checkbox", { name });
  await tick.click();
  const question = "Can we bring our own pillows?";
  await page.getByRole("textbox", { name: "New question" }).fill(question);
  await page.getByRole("button", { name: "Add question" }).click();
  await expect(page.getByText(question)).toBeVisible();
  await page.reload();
  await expect(page.getByText(question)).toBeVisible();
  // Ticked, it has gone to what's done.
  await page.getByRole("button", { name: /^Done/ }).click();
  await expect(tick).toBeChecked();
  expect(await waitingSaves(page)).toBe(2);
  await expect(page.getByText("That didn't save")).toHaveCount(0);

  // Back online, they go: once nothing waits on this phone, another page has them from the server.
  await context.setOffline(false);
  await expect.poll(() => waitingSaves(page)).toBe(0);
  const other = await context.newPage();
  await other.goto("/planner", { waitUntil: "networkidle" });
  await expect(other.getByText(question)).toBeVisible();
  await other.getByRole("button", { name: /^Done/ }).click();
  await expect(other.getByRole("checkbox", { name })).toBeChecked();
});
