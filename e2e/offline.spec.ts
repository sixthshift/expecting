// Offline: once the service worker has the app (src/pwa/worker.js), a phone
// with no connection still opens it, every built-in item reads, and what was
// last fetched is on screen. Hospital Wi-Fi is the case.
import { expect, test } from "./fixtures";

// Offline, the save's request fails, and the browser says so in the console.
test.use({ allowedErrors: [/ERR_INTERNET_DISCONNECTED|Failed to fetch/] });

test("the app opens and reads with no connection", async ({ page, context, open }) => {
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

  // A save fails at once and says so, rather than wait for a connection; the tick goes back.
  await open("/planner");
  const tick = page.getByRole("checkbox").first();
  const was = await tick.isChecked();
  await tick.click();
  await expect(page.getByText("That didn't save")).toBeVisible();
  await expect(tick).toBeChecked({ checked: was });
  await context.setOffline(false);
});
