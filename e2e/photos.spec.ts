// Photos and scans: a scan photographed from the "+", a bump photo from the
// "+" on the Journal, each kept by whoever is holding the
// phone, sent up with its save and drawn back from the server behind the
// gate. The Journal shows them by week and the bump week by week, the
// timeline marks the week, and deleting asks first. Runs after the journey
// (at week 28) and before quiet.spec.ts, which checks they're folded away
// after a loss, as specs run by name.
import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/** A JPEG drawn in the page: a blue sky with a pink bump. No EXIF, so it's taken now. */
async function picture(page: Page, name: string) {
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 800;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#9DC3E2";
    context.fillRect(0, 0, 600, 800);
    context.fillStyle = "#FFB5CC";
    context.beginPath();
    context.arc(300, 450, 180, 0, Math.PI * 2);
    context.fill();
    return canvas.toDataURL("image/jpeg", 0.9).split(",")[1]!;
  });
  return { name, mimeType: "image/jpeg", buffer: Buffer.from(base64, "base64") };
}

/** Whether an image has loaded and drawn: brought into view first, as the pictures load lazily. */
async function drawn(image: Locator): Promise<boolean> {
  await image.scrollIntoViewIfNeeded();
  return image.evaluate((img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0);
}

test('a scan from the "+", kept by week in the Journal, drawn from the server, and marked on the timeline', async ({ page, open }) => {
  await open("/planner");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "A photo or scan" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Choose photos").setInputFiles(await picture(page, "scan.jpg"));
  await expect(sheet.getByText("What is it?")).toBeVisible();
  await expect(sheet.getByRole("button", { name: /^Today, .* · Week 28 · Change$/ })).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Keep it" })).toBeDisabled();
  await sheet.getByRole("radio", { name: "Scan" }).click();
  await sheet.getByRole("textbox", { name: "A few words, if you want" }).fill("20-week scan, all well");
  await sheet.getByRole("button", { name: "Keep it" }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByText("In the Journal")).toBeVisible();
  await expect(page).toHaveURL(/\/planner$/);

  await open("/journal?view=photos");
  const section = page.getByRole("region", { name: "Photos and scans" });
  const scan = section.getByRole("img", { name: /^Scan, week 28, .*20-week scan, all well$/ });
  await expect(scan).toBeVisible();
  await expect.poll(() => drawn(scan)).toBe(true);
  expect(await scan.getAttribute("src")).toMatch(/^\/api\/files\/[0-9a-f-]{36}\/thumb$/);

  await open("/timeline");
  await expect(page.locator('[data-week="28"]')).toContainText("scan");
});

test('a bump photo from the "+" on the Journal, then opened, and its original downloads only with a session', async ({ page, open, playwright }) => {
  await open("/journal");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "A photo or scan" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Take a photo").setInputFiles(await picture(page, "bump.jpg"));
  await sheet.getByRole("radio", { name: "Bump" }).click();
  await sheet.getByRole("button", { name: "Keep it" }).click();
  await expect(sheet).toBeHidden();
  // One week isn't a series yet: no frame asks for the next.
  await open("/journal?view=photos");
  const row = page.getByRole("region", { name: "Your bump, week by week" });
  await expect(row.getByRole("img", { name: "Your bump at week 28" })).toBeVisible();
  await expect(row.getByRole("button", { name: /^Take week/ })).toBeHidden();

  const bump = page.getByRole("region", { name: "Your bump, week by week" }).getByRole("img", { name: "Your bump at week 28" });
  await expect.poll(() => drawn(bump)).toBe(true);
  await bump.click();
  const viewer = page.getByRole("dialog", { name: "Bump photo · Week 28" });
  await expect.poll(() => drawn(viewer.getByRole("img"))).toBe(true);
  const href = await viewer.getByRole("link", { name: "Download the original" }).getAttribute("href");
  expect(href).toMatch(/^\/api\/files\/[0-9a-f-]{36}\/original\?download$/);

  const withSession = await page.request.get(href!);
  expect(withSession.status()).toBe(200);
  expect(withSession.headers()["content-type"]).toBe("image/jpeg");
  expect(withSession.headers()["content-disposition"]).toMatch(/^attachment; filename="bump.jpg"/);
  // Behind the gate: without the session, nothing.
  const stranger = await playwright.request.newContext({ baseURL: new URL(page.url()).origin });
  expect((await stranger.get(href!)).status()).toBe(401);
  await stranger.dispose();
});

test("deleting asks first, and then it's gone from the Journal", async ({ page, open }) => {
  await open("/journal?view=photos");
  const section = page.getByRole("region", { name: "Photos and scans" });
  await section.getByRole("img", { name: /^Scan, week 28/ }).click();
  const viewer = page.getByRole("dialog");
  await viewer.getByRole("button", { name: "Delete" }).click();
  await expect(viewer.getByText("Delete this photo? It goes from both phones, and can't be put back.")).toBeVisible();
  await viewer.getByRole("button", { name: "Delete it" }).click();
  await expect(viewer).toBeHidden();
  await expect(section.getByRole("img", { name: /^Scan, week 28/ })).toBeHidden();

  await open("/journal?view=photos");
  await expect(page.getByRole("region", { name: "Photos and scans" }).getByRole("img", { name: /^Scan, week 28/ })).toBeHidden();
  // The bump stays, for quiet.spec.ts to find folded away.
  await expect(page.getByRole("region", { name: "Your bump, week by week" }).getByRole("img", { name: "Your bump at week 28" })).toBeVisible();
});
