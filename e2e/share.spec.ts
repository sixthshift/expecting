// Sharing into Expecting: the phone's share sheet posts to /share (the
// manifest's share_target), the service worker keeps what came and opens the
// app (src/pwa/worker.js), and the "+" opens with it, offering only what it
// can become (src/features/capture/components/SharedIn.tsx). The share sheet
// itself is the phone's; here the page posts the same form the phone would.
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/** Once the worker has the page: before then a share would reach the server, which has no /share. */
async function workerReady(page: Page) {
  await page.waitForFunction(async () => Boolean((await navigator.serviceWorker.ready).active && navigator.serviceWorker.controller), undefined, {
    timeout: 60_000,
    polling: 500,
  });
}

/** Share into the app as the phone's share sheet would: a form posted to /share, then the app it opens. */
async function share(page: Page, form: { text?: string; url?: string; pdf?: string }) {
  await page.evaluate(async ({ text, url, pdf }) => {
    const body = new FormData();
    if (text) body.append("text", text);
    if (url) body.append("url", url);
    if (pdf) body.append("files", new File([pdf], "Referral letter.pdf", { type: "application/pdf" }));
    // The worker's answer sends the page on to /, which it may answer from its cache, so `redirected` can't be trusted; the sheet that opens is the proof.
    const answer = await fetch("/share", { method: "POST", body });
    if (!answer.ok) throw new Error(`/share: ${answer.status}`);
  }, form);
  await page.goto("/");
}

const PDF =
  "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [] /Count 0 >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n";

test("words shared from another app become a question, and a PDF goes straight to a paper", async ({ page, open }) => {
  await open("/");
  await workerReady(page);

  // Words and a link: a note, a question or a task, the question's form starting with them.
  const question = "Should we do the glucose test early?";
  await share(page, { text: question, url: "https://example.com/gtt" });
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("heading", { name: "Keep what was shared" })).toBeVisible();
  await expect(sheet.getByRole("button", { name: /^A / })).toHaveText([/A note/, /A question to ask/]);
  await expect(sheet.getByRole("button", { name: "Something to do" })).toBeVisible();
  await expect(sheet.getByRole("button", { name: "A photo or scan" })).toHaveCount(0);
  await sheet.getByRole("button", { name: "A question to ask" }).click();
  await expect(sheet.getByRole("textbox", { name: "New question" })).toHaveValue(`${question}\nhttps://example.com/gtt`);
  await sheet.getByRole("button", { name: "Add question" }).click();
  await expect(sheet).toBeHidden();
  await open("/planner");
  await expect(page.getByText(question)).toBeVisible();

  // Taken once: opening the app again doesn't offer it again.
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "This week" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // A PDF can only be a paper: straight to its form, the page in it.
  await share(page, { pdf: PDF });
  await expect(sheet.getByRole("heading", { name: "A result or paper" })).toBeVisible();
  await expect(sheet.getByRole("img", { name: "Page 1: Referral letter.pdf" })).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Back to what to add" })).toHaveCount(0);
});
