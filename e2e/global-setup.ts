// The first visit, once per run: the empty database has nobody, so /login
// sets Expecting up. Doing it here, as Jason, the partner, before any spec,
// means every spec meets the login it would after setup, whatever order they
// run in. Sam joins later, by Jason's invite (journey.spec.ts).
import { chromium, expect, type FullConfig } from "@playwright/test";
import { PASSWORDS } from "./playwright.config";

export default async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: config.projects[0]!.use.baseURL });
  // Any page goes to /login, which asks to set it up rather than log in.
  await page.goto("/settings", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/login\?next=%2Fsettings$/);
  await page.getByRole("button", { name: "I'm the partner" }).click();
  await page.getByLabel("Your name").fill("Jason");
  await page.getByLabel("Password", { exact: true }).fill(PASSWORDS.Jason);
  await page.getByLabel("The same again").fill(PASSWORDS.Jason);
  await page.getByRole("button", { name: "Set up Expecting" }).click();
  // It logs this browser in and goes on to where it was going: first, onboarding.
  await page.waitForURL((url) => url.pathname !== "/login");
  await browser.close();
}
