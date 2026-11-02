// How you're feeling: asked on This week, kept in the Journal and shown on its
// week. The step is shared; the words are only ever sent to the phone of the
// person they're about.

import { expect, test } from "./fixtures";
import { PASSWORD } from "./playwright.config";

test("a check-in is kept with its words, and the other phone sees the step but never the words", async ({ page, open, browser }) => {
  await open("/");
  const checkIn = page.getByRole("region", { name: "How are you today, Jason?" });
  await checkIn.getByText("Low", { exact: true }).click();
  await checkIn.getByRole("button", { name: "tired" }).click();
  await checkIn.getByRole("textbox", { name: "Say more" }).fill("Long day at work");
  await checkIn.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("heading", { name: "Low today" })).toBeVisible();

  await open("/journal/records/feelings");
  const feelings = page.getByRole("region", { name: "How you're feeling" });
  await expect(feelings.getByText("Your words: tired, 1 day")).toBeVisible();
  await expect(feelings.getByText("Long day at work")).toBeVisible();

  await open("/timeline");
  await expect(page.locator("[data-week]").filter({ hasText: "Felt: Low" })).toHaveCount(1);

  // Sam, on another phone: Jason's step, and nothing of what Jason wrote, on screen or on the wire.
  const phone = await browser.newContext();
  const sam = await phone.newPage();
  const bodies: string[] = [];
  sam.on("response", async (response) => {
    // A body cut off by the page moving on is gone either way.
    if (response.url().includes("/api/rpc/")) bodies.push(await response.text().catch(() => ""));
  });
  await sam.goto("/login", { waitUntil: "networkidle" });
  await sam.getByLabel("Password").fill(PASSWORD);
  await sam.getByRole("button", { name: "Log in" }).click();
  await sam.waitForURL((url) => url.pathname !== "/login");
  await sam.goto("/onboarding", { waitUntil: "networkidle" });
  await sam.getByRole("button", { name: "I'm Sam" }).click();
  await sam.waitForURL((url) => !url.pathname.startsWith("/onboarding"));
  await expect(sam.getByRole("heading", { name: "How are you today, Sam?" })).toBeVisible();
  await sam.goto("/journal/records/feelings", { waitUntil: "networkidle" });
  const samFeelings = sam.getByRole("region", { name: "How you're feeling" });
  await expect(samFeelings.getByText("Jason", { exact: true })).toBeVisible();
  await expect(samFeelings.getByRole("region", { name: "Today" }).getByText("Low", { exact: true })).toBeVisible();
  await expect(samFeelings.getByText("Long day at work")).toHaveCount(0);
  await expect(samFeelings.getByText(/tired/)).toHaveCount(0);
  // Jason's step came over the wire, and nothing he wrote did.
  await expect.poll(() => bodies.some((body) => body.includes('"low"'))).toBe(true);
  for (const body of bodies) {
    expect(body).not.toContain("Long day at work");
    expect(body).not.toContain("tired");
  }
  await phone.close();

  // Only Jason can change or delete it, and a deleted check-in can be put back.
  await open("/journal/records/feelings");
  await feelings.getByRole("button", { name: "Delete this check-in" }).click();
  await expect(feelings.getByText("Long day at work")).toBeHidden();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(feelings.getByText("Long day at work")).toBeVisible();
});
