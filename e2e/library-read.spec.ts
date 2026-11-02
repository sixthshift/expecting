// The Library's read marks: opening an entry marks it read for whoever opened
// it, and the lists tick it. Each of you has your own.
import { expect, logIn, test, waitingSaves } from "./fixtures";

test("an entry opened is ticked read in the lists, on your phone only", async ({ page, open, browser }) => {
  await open("/library?q=haloumi");
  const link = page.getByRole("link", { name: /^Hard cheese, cream cheese/ }).first();
  await expect(link).toBeVisible();
  await expect(link.getByText("Read", { exact: true })).toHaveCount(0);

  await link.click();
  await expect(page.getByRole("heading", { level: 1, name: /^Hard cheese, cream cheese/ })).toBeVisible();
  await expect.poll(() => waitingSaves(page)).toBe(0);
  await page.goBack();
  await expect(
    page
      .getByRole("link", { name: /^Hard cheese, cream cheese/ })
      .first()
      .getByText("Read", { exact: true })
  ).toBeAttached();

  // Sam hasn't read it.
  const phone = await browser.newContext();
  const sam = await phone.newPage();
  await logIn(sam, "Sam");
  await sam.goto("/library?q=haloumi", { waitUntil: "networkidle" });
  const hers = sam.getByRole("link", { name: /^Hard cheese, cream cheese/ }).first();
  await expect(hers).toBeVisible();
  await expect(hers.getByText("Read", { exact: true })).toHaveCount(0);
  await phone.close();
});

/** A finger swiping across the page, from `from` to `to` px across, halfway down. */
async function swipe(page: import("@playwright/test").Page, from: number, to: number) {
  await page.evaluate(
    ({ from, to }) => {
      const el = document.querySelector("main h1")!;
      const y = window.innerHeight / 2;
      const touch = (x: number) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
      const fire = (type: string, x: number, touches: Touch[]) =>
        el.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches, changedTouches: [touch(x)] }));
      fire("touchstart", from, [touch(from)]);
      for (let i = 1; i <= 5; i++) fire("touchmove", from + ((to - from) * i) / 5, [touch(from + ((to - from) * i) / 5)]);
      fire("touchend", to, []);
    },
    { from, to }
  );
}

test("an entry opened from a shelf swipes on through it, and Back is to the shelf", async ({ page, open }) => {
  await open("/library?door=can-i");
  const rows = page.getByRole("main").getByRole("listitem").getByRole("link");
  const titleOf = (n: number) => rows.nth(n).locator("span").first().innerText();
  const [first, second] = [await titleOf(0), await titleOf(1)];
  await rows.nth(0).click();
  const title = page.getByRole("heading", { level: 1 });
  await expect(title).toHaveText(first);
  // Nothing before the first.
  await expect(page.getByRole("navigation", { name: "Through the list" }).getByText("Previous")).toHaveCount(0);

  await swipe(page, 300, 80);
  await expect(title).toHaveText(second);
  await swipe(page, 80, 300);
  await expect(title).toHaveText(first);
  await page.getByRole("navigation", { name: "Through the list" }).getByRole("link", { name: /^Next/ }).click();
  await expect(title).toHaveText(second);

  await page.goBack();
  await expect(page).toHaveURL(/\/library\?door=can-i$/);
});

test("back out of an entry, the shelf is where you left it, by its link or by Back", async ({ page, open }) => {
  await open("/library?door=can-i");
  const rows = page.getByRole("main").getByRole("listitem").getByRole("link");
  const far = rows.nth((await rows.count()) - 3);
  await far.scrollIntoViewIfNeeded();
  const left = await page.evaluate(() => window.scrollY);
  expect(left).toBeGreaterThan(500);

  await far.click();
  await expect(page).toHaveURL(/\/library\/[^?]+$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
  await page.getByRole("link", { name: "Can I…?", exact: true }).click();
  await expect(page).toHaveURL(/\/library\?door=can-i$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(left - 50);

  await far.click();
  await expect(page).toHaveURL(/\/library\/[^?]+$/);
  await page.goBack();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(left - 50);
});
