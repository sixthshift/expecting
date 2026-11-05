// The two accounts' upkeep, after journey.spec.ts has Sam join: a new
// password for the other by a link (here typed as its code), which logs out
// every phone of theirs; and changing your own. Each puts the passwords back
// as the fixture knows them.
import { expect, logIn, test } from "./fixtures";
import { PASSWORDS } from "./playwright.config";

test("Sam forgot her password: Jason makes her a link, and choosing a new one logs out her other phones", async ({ page, open, browser }) => {
  // Sam is logged in on a phone already.
  const before = await browser.newContext();
  const old = await before.newPage();
  await logIn(old, "Sam");

  await open("/settings/account");
  const account = page.getByRole("region", { name: "Account" });
  await account.getByRole("button", { name: "Sam forgot their password" }).click();
  const code = await account.locator(".font-mono").last().textContent();
  expect(code).toMatch(/^[0-9A-Z]{3}(-[0-9A-Z]{3}){3}$/);

  // On her new phone, she types the code rather than opening the link.
  const after = await browser.newContext();
  const sam = await after.newPage();
  await sam.goto("/reset", { waitUntil: "networkidle" });
  await sam.getByLabel("Code").fill(code!.toLowerCase());
  await sam.getByRole("button", { name: "Go on" }).click();
  await expect(sam.getByText("A new password for Sam.", { exact: false })).toBeVisible();
  await sam.getByLabel("Password", { exact: true }).fill(PASSWORDS.Sam);
  await sam.getByLabel("The same again").fill(PASSWORDS.Sam);
  await sam.getByRole("button", { name: "Choose it" }).click();
  await expect(sam.getByRole("heading", { level: 1, name: /^This week/ })).toBeVisible();

  // Her old phone was logged out.
  await old.goto("/settings");
  await expect(old).toHaveURL(/\/login\?next=%2Fsettings$/);
  await before.close();
  await after.close();
});

test("changing your own password asks the one you have now", async ({ page, open }) => {
  await open("/settings/account");
  const account = page.getByRole("region", { name: "Account" });
  const change = async (from: string, to: string) => {
    await account.getByRole("button", { name: "Change your password" }).click();
    await account.getByLabel("Your password now").fill(from);
    await account.getByLabel("Password", { exact: true }).fill(to);
    await account.getByLabel("The same again").fill(to);
    await account.getByRole("button", { name: "Change it" }).click();
  };
  await change("not it", "a brand new one");
  await expect(account.getByText("That's not it.")).toBeVisible();
  await account.getByRole("button", { name: "Cancel" }).click();
  await change(PASSWORDS.Jason, "a brand new one");
  await expect(account.getByText("Changed. Your other phones and computers will ask for it.")).toBeVisible();
  // This phone stayed in. And back, for the specs after.
  await change("a brand new one", PASSWORDS.Jason);
  await expect(account.getByText("Changed.", { exact: false })).toBeVisible();
});
