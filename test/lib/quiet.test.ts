import { expect, test } from "vitest";
import { builtInItems, loadPage } from "../../src/content";
import type { Item, Task } from "../../src/content/schema";
import { sectionsOf } from "../../src/content/sections";
import { canBecome, NEXT_STEPS, nextSteps, pausedAt, QUIET_ITEM, QUIET_KINDS, QUIET_PARTS, type Quiet, setInMotion } from "../../src/lib/quiet";

const quiet = (kind: Quiet["kind"]): Quiet => ({ kind, setBy: null, setAt: "2026-10-30T09:00:00.000Z" });
const byId = (id: string) => builtInItems.find((i) => i.id === id) as Item;

function task(id: string, itemId: string | null): Task {
  return { id, title: id, opens: 1, due: 20, deadline: null, deadlineFrom: null, who: "together", itemId, origin: itemId ? "built-in" : "own" } as Task;
}

test("anything can happen first; hard news can become a loss, never the other way", () => {
  for (const kind of QUIET_KINDS) expect(canBecome(null, kind)).toBe(true);
  expect(canBecome(quiet("news"), "loss")).toBe(true);
  expect(canBecome(quiet("loss"), "news")).toBe(false);
  expect(canBecome(quiet("loss"), "loss")).toBe(false);
});

test("the timeline pauses at the week it was when something happened", () => {
  // Due 32 weeks after 2026-10-30: 8+0 that day.
  expect(pausedAt(quiet("loss"), "2027-06-11")).toBe(8);
  expect(pausedAt(quiet("loss"), null)).toBeNull();
});

test("every next step is a built-in item", () => {
  for (const kind of QUIET_KINDS) for (const id of NEXT_STEPS[kind]) expect(byId(id), id).toBeDefined();
});

test("the next steps hold the week it happened: a miscarriage at 8 weeks isn't offered stillbirth", () => {
  const early = nextSteps(builtInItems, "loss", 8).map((i) => i.id);
  expect(early).toContain("after-a-miscarriage");
  expect(early).not.toContain("stillbirth");
  const late = nextSteps(builtInItems, "loss", 30).map((i) => i.id);
  expect(late).toContain("stillbirth");
  expect(late).not.toContain("after-a-miscarriage");
  // Without a week, all of them, in order.
  expect(nextSteps(builtInItems, "news", null).map((i) => i.id)).toEqual(NEXT_STEPS.news);
});

test("a next step tailored out of your library isn't offered", () => {
  expect(nextSteps([byId("loss-and-work")], "loss", 8).map((i) => i.id)).toEqual(["loss-and-work"]);
});

test("what was set in motion: claims apart from bookings, only what's ticked", () => {
  const items = [byId("parental-leave-pay-claim"), byId("loss-and-work")];
  const tasks = [task("claim", "parental-leave-pay-claim"), task("booked", "loss-and-work"), task("mine", null), task("not-yet", "loss-and-work")];
  const { claims, bookings } = setInMotion(tasks, { claim: "t", booked: "t", mine: "t" }, items);
  expect(claims.map((t) => t.id)).toEqual(["claim"]);
  expect(bookings.map((t) => t.id)).toEqual(["booked", "mine"]);
});

test("the guide has every part This week shows while it's quiet", async () => {
  const sections = sectionsOf((await loadPage(byId(QUIET_ITEM))).doc).map((s) => s.title);
  expect(sections[0]).toBeNull();
  for (const kind of QUIET_KINDS) for (const part of QUIET_PARTS[kind]) expect(sections).toContain(part);
});
