import { expect, test } from "vitest";
import { builtInItems, loadPage } from "../../../src/content";
import type { Item } from "../../../src/content/schema";
import { sectionsOf } from "../../../src/content/sections";
import { NEXT_STEPS, nextSteps, pausedAt, QUIET_PARTS } from "../../../src/lib/home/quiet";
import { QUIET_ITEM, QUIET_KINDS, type Quiet } from "../../../src/lib/quiet";

const quiet = (kind: Quiet["kind"]): Quiet => ({ kind, setBy: null, setAt: "2026-10-30T09:00:00.000Z" });
const byId = (id: string) => builtInItems.find((i) => i.id === id) as Item;

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

test("the guide has every part Home shows while it's quiet", async () => {
  const sections = sectionsOf((await loadPage(byId(QUIET_ITEM))).doc).map((s) => s.title);
  expect(sections[0]).toBeNull();
  for (const kind of QUIET_KINDS) for (const part of QUIET_PARTS[kind]) expect(sections).toContain(part);
});
