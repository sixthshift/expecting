// Results and papers: a photographed result of two pages from the "+", said
// what it is and what it's about (which names it), kept handy, so it's on
// Emergency info, under its Library entry, and marked on the timeline; a PDF
// letter from the Journal, opened behind the gate; and deleting asks first.
// Runs after the journey (at week 28), as specs run by name.
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/** A JPEG drawn in the page: a white sheet with a few grey lines. */
async function sheet(page: Page, name: string) {
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 850;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, 600, 850);
    context.fillStyle = "#888888";
    for (let y = 80; y < 800; y += 40) context.fillRect(60, y, 480, 6);
    return canvas.toDataURL("image/jpeg", 0.9).split(",")[1]!;
  });
  return { name, mimeType: "image/jpeg", buffer: Buffer.from(base64, "base64") };
}

/** A small PDF: only its first bytes are read, to say it is one. */
function pdf(name: string) {
  const body =
    "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [] /Count 0 >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n";
  return { name, mimeType: "application/pdf", buffer: Buffer.from(body, "latin1") };
}

test('a photographed result of two pages from the "+", about the glucose test, kept handy and found where it\'s wanted', async ({ page, open }) => {
  await open("/planner");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "A result or paper" }).click();
  const form = page.getByRole("dialog");
  await form.getByLabel("Choose a file").setInputFiles([await sheet(page, "page-1.jpg"), await sheet(page, "page-2.jpg")]);
  await expect(form.getByRole("list", { name: "The 2 pages" })).toBeVisible();
  await expect(form.getByRole("button", { name: "Keep it" })).toBeDisabled();
  await form.getByRole("radio", { name: "Result" }).click();
  await form.getByRole("combobox", { name: "What it's about" }).click();
  await page.getByRole("option", { name: "Glucose tolerance test" }).click();
  // Choosing what it's about names it.
  await expect(form.getByRole("textbox", { name: "Its name" })).toHaveValue("Glucose tolerance test");
  await expect(form.getByRole("button", { name: /^Dated today · Week 28 · Change$/ })).toBeVisible();
  await form.getByRole("switch", { name: "Keep handy" }).click();
  await form.getByRole("button", { name: "Keep it" }).click();
  await expect(form).toBeHidden();
  await expect(page.getByText("In the Journal")).toBeVisible();
  await expect(page).toHaveURL(/\/planner$/);

  await open("/journal/records/papers");
  const section = page.getByRole("region", { name: "Results and papers" });
  const row = section.getByRole("button", { name: /^Glucose tolerance test/ });
  await expect(row).toContainText("Result · Dated today · Week 28 · 2 pages");
  await row.click();
  const viewer = page.getByRole("dialog", { name: "Glucose tolerance test" });
  await expect(viewer.getByRole("img", { name: "Glucose tolerance test, page 2 of 2" })).toBeVisible();
  await expect(viewer.getByRole("link", { name: "The glucose tolerance test" })).toBeVisible();
  await viewer.getByRole("button", { name: "Close" }).click();

  // Handy: on Emergency info, for triage at 2 am.
  await open("/emergency");
  await expect(page.getByRole("region", { name: "Papers to hand" }).getByRole("button", { name: /^Glucose tolerance test/ })).toBeVisible();

  // Under its Library entry.
  await open("/library/glucose-tolerance-test");
  await expect(page.getByRole("region", { name: "Your papers" }).getByRole("button", { name: /^Glucose tolerance test/ })).toBeVisible();

  // And on its week, quietly.
  await open("/timeline");
  await expect(page.locator('[data-week="28"]')).toContainText("result");
});

test('a PDF letter from the "+" on the Journal, opened behind the gate', async ({ page, open, playwright }) => {
  await open("/journal");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "A result or paper" }).click();
  const form = page.getByRole("dialog");
  await form.getByLabel("Choose a file").setInputFiles(pdf("Referral.pdf"));
  await expect(form.getByRole("img", { name: "Page 1: Referral.pdf" })).toBeVisible();
  await form.getByRole("radio", { name: "Letter or referral" }).click();
  await form.getByRole("textbox", { name: "Its name" }).fill("Referral to the hospital");
  await form.getByRole("button", { name: "Keep it" }).click();
  await expect(form).toBeHidden();

  // On this week's page, and in its lens.
  await expect(page.getByRole("region", { name: "This week" }).getByRole("button", { name: "Open: Referral to the hospital" })).toContainText(
    "Letter or referral"
  );
  await open("/journal/records/papers");
  await page
    .getByRole("region", { name: "Results and papers" })
    .getByRole("button", { name: /^Referral to the hospital/ })
    .click();
  const viewer = page.getByRole("dialog", { name: "Referral to the hospital" });
  const href = await viewer.getByRole("link", { name: "Open" }).getAttribute("href");
  expect(href).toMatch(/^\/api\/files\/[0-9a-f-]{36}\/original$/);

  const withSession = await page.request.get(href!);
  expect(withSession.status()).toBe(200);
  expect(withSession.headers()["content-type"]).toBe("application/pdf");
  // Behind the gate: without the session, nothing.
  const stranger = await playwright.request.newContext({ baseURL: new URL(page.url()).origin });
  expect((await stranger.get(href!)).status()).toBe(401);
  await stranger.dispose();
});

test("deleting asks first, and then it's gone", async ({ page, open }) => {
  await open("/journal/records/papers");
  const section = page.getByRole("region", { name: "Results and papers" });
  await section.getByRole("button", { name: /^Referral to the hospital/ }).click();
  const viewer = page.getByRole("dialog", { name: "Referral to the hospital" });
  await viewer.getByRole("button", { name: "Delete" }).click();
  await expect(viewer.getByText("Delete this paper? Every page goes from both phones, and can't be put back.")).toBeVisible();
  await viewer.getByRole("button", { name: "Delete it" }).click();
  await expect(viewer).toBeHidden();
  await expect(section.getByRole("button", { name: /^Referral to the hospital/ })).toBeHidden();

  await open("/journal/records/papers");
  await expect(page.getByRole("region", { name: "Results and papers" }).getByRole("button", { name: /^Referral to the hospital/ })).toBeHidden();
  // The handy result stays.
  await expect(page.getByRole("region", { name: "Results and papers" }).getByRole("button", { name: /^Glucose tolerance test/ })).toBeVisible();
});
