// The first visit, once per run: the empty database has no
// password, so /login asks for one. Choosing it here, before any spec, means
// every spec meets the login it would after setup, whatever order they run in.
import { chromium, expect, type FullConfig } from "@playwright/test";
import { PASSWORD } from "./playwright.config";

export default async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: config.projects[0]!.use.baseURL });
  // Any page goes to /login, which asks for a password rather than one to log in with.
  await page.goto("/settings", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/login\?next=%2Fsettings$/);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("The same again").fill(PASSWORD);
  await page.getByRole("button", { name: "Choose it" }).click();
  // It logs this browser in and goes on to where it was going.
  await page.waitForURL((url) => url.pathname !== "/login");
  await browser.close();
}
