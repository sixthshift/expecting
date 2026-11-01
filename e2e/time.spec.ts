// It's time: the page for the night it starts (docs/product/its-time.md). At 28
// weeks (the journey's due date) the way in isn't drawn yet, but Emergency info
// leads there for a labour that starts early. A start, from the contractions
// to the waters to "We're there", partly with no connection; the night is then
// in the Journal. A false alarm after it, so this spec leaves nothing under way.
import { expect, test, waitingSaves } from "./fixtures";

test.describe.configure({ mode: "serial" });

// Offline, a save's request fails, and the browser says so in the console; the save waits.
test.use({ allowedErrors: [/ERR_INTERNET_DISCONNECTED|Failed to fetch/] });

test("before 36 weeks it isn't in the corner, but Emergency info leads to it", async ({ page, open }) => {
  await open("/");
  await expect(page.getByRole("link", { name: "It's time", exact: true })).toHaveCount(0);

  await open("/emergency");
  await page.getByRole("link", { name: "Labour started early? It's time" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "It's time" })).toBeVisible();
  // Getting ready: the two ways in, what the night still needs, and the rest as the night will show it.
  await expect(page.getByText("Nothing's started. When it does, tap one of these.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ready for the night" })).toBeVisible();
  // The journey filled in the birth suite's number: it's the first call.
  await expect(page.getByRole("navigation", { name: "The calls" }).getByRole("link", { name: "Call the birth suite" })).toBeVisible();
  await expect(page.getByText(/Before 37 weeks, contractions or the waters breaking/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Call now, don't wait, if" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "When you ring, they'll ask" })).toBeVisible();
  // The bag is a list of its own, with its last things for the night.
  await expect(page.getByRole("checkbox", { name: "Phone chargers" })).toBeDisabled();
});

test("a start: timed, the waters, out the door and there, partly offline; the night goes in the Journal", async ({ page, context, open }) => {
  await open("/its-time");
  await page.getByRole("button", { name: "Contractions started" }).click();
  await expect(page.getByText(/^Started \d{1,2}:\d\d [ap]m/)).toBeVisible();
  // Under way, the way back is in the corner, whatever the week.
  await open("/");
  await page.getByRole("link", { name: "It's time", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "It's time" })).toBeVisible();

  // One tap as it starts, one as it ends.
  const timer = page.getByRole("button", { name: /^One's started/ });
  await timer.click();
  await page.getByRole("button", { name: /^It's ended/ }).click();
  await expect(page.getByRole("list").filter({ hasText: /\d+ s/ })).toBeVisible();

  // No signal in the lift: a tap still counts, and goes once there's a connection.
  await context.setOffline(true);
  await timer.click();
  await page.getByRole("button", { name: /^It's ended/ }).click();
  await expect.poll(() => waitingSaves(page)).toBeGreaterThan(0);
  await context.setOffline(false);
  await expect.poll(() => waitingSaves(page)).toBe(0);
  await expect(page.getByText(/in the last 10 min/).first()).toBeVisible();

  // Tapped by mistake: undone.
  await timer.click();
  await page.getByRole("button", { name: "Undo this one" }).click();
  await expect(page.getByRole("button", { name: /^One's started/ })).toBeVisible();

  // The waters, then their colour: green or brown is a call, said loudest.
  await page.getByRole("button", { name: "Waters broke" }).click();
  await page.getByRole("button", { name: "Green, brown or blood-coloured" }).click();
  await expect(page.getByRole("alert")).toContainText("Green, brown or blood-coloured waters");
  await page.getByRole("button", { name: "Change" }).click();
  await page.getByRole("button", { name: "Clear, pink or straw-coloured" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText(/^Broke \d{1,2}:\d\d [ap]m, clear/).first()).toBeVisible();

  // A last thing ticked for this start, and one of your own.
  // A tick shows a beat after the tap (the outbox applies it), so it's clicked and then looked for.
  await page.getByRole("checkbox", { name: "Phone chargers" }).click();
  await expect(page.getByRole("checkbox", { name: "Phone chargers" })).toBeChecked();
  await page.getByRole("textbox", { name: "A last thing of your own" }).fill("Turn the heater off");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("checkbox", { name: "Turn the heater off" }).click();
  await expect(page.getByRole("checkbox", { name: "Turn the heater off" })).toBeChecked();

  await page.getByRole("button", { name: "We're leaving" }).click();
  await expect(page.getByText(/^You left at/)).toBeVisible();
  await page.getByRole("button", { name: "We're there" }).click();
  await page.getByRole("button", { name: "We're there" }).click();
  await expect(page.getByText("Nothing's started. When it does, tap one of these.")).toBeVisible();
  // Your own line is kept for next time, unticked.
  await expect(page.getByRole("checkbox", { name: "Turn the heater off" })).not.toBeChecked();

  await open("/journal");
  await expect(page.getByRole("button", { name: "Open: it started" })).toContainText(/Waters broke .* \(clear\) · timing from .* · left .* · there /);
});

test("a false alarm is kept in It's time, not the story, and said kindly", async ({ page, open }) => {
  await open("/its-time");
  await page.getByRole("button", { name: "The waters broke" }).click();
  await page.getByRole("button", { name: "Not sure, or can't tell" }).click();
  await page.getByRole("button", { name: "False alarm, we're home" }).click();
  await page.getByRole("button", { name: "False alarm, we're home" }).click();
  await expect(page.getByText(/Sent home for now\? That's common in early labour/)).toBeVisible();
  // Nothing under way: the corner is quiet again at 28 weeks.
  await open("/");
  await expect(page.getByRole("link", { name: "It's time", exact: true })).toHaveCount(0);
  await open("/journal");
  await expect(page.getByRole("button", { name: "Open: it started" })).toHaveCount(1);
});
