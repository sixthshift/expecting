import { expect, test } from "vitest";
import type { Task } from "../../src/content/schema";
import { groupTasks, type PlannerPlan } from "../../src/lib/planner";
import type { Slot } from "../../src/lib/timeline";

const wk = (week: number): Slot => ({ phase: "pregnancy", week });
const pp = (week: number): Slot => ({ phase: "postpartum", week });
const BEFORE: Slot = { phase: "preconception" };
const task = (id: string, due: Slot): Task => ({ id, title: id, due, itemId: null, origin: "own" });
const ids = (tasks: Task[]) => tasks.map((t) => t.id);

// The plans each phase's app gives (src/features/phases/<phase>/index.ts).
const GETTING_READY: PlannerPlan = { grouping: "getting-ready", earlier: "slip" };
const PREGNANCY: PlannerPlan = { grouping: "weeks", earlier: "slip" };
const NEWBORN: PlannerPlan = { grouping: "weeks", earlier: "leave-behind" };

const tasks = [task("later", wk(36)), task("slipped", wk(25)), task("now", wk(28)), task("soon", wk(32)), task("after", pp(1))];

test("tasks group by when they matter against this week", () => {
  const groups = groupTasks(tasks, {}, new Set(), wk(28), PREGNANCY);
  expect(ids(groups.slipped)).toEqual(["slipped"]);
  expect(ids(groups.now)).toEqual(["now"]);
  expect(ids(groups.soon)).toEqual(["soon"]);
  expect(ids(groups.later)).toEqual(["later", "after"]);
  expect(groups.done).toEqual([]);
  expect(groups.behind).toEqual([]);
});

test("a ticked task is done, unless it was ticked during this visit", () => {
  const ticks = { slipped: "t", now: "t" };
  const groups = groupTasks(tasks, ticks, new Set(["now"]), wk(28), PREGNANCY);
  expect(ids(groups.done)).toEqual(["slipped"]);
  expect(ids(groups.now)).toEqual(["now"]);
});

test("with no due date, every open task is simply to do, in order", () => {
  const groups = groupTasks(tasks, {}, new Set(), null, PREGNANCY);
  expect(ids(groups.later)).toEqual(["slipped", "now", "soon", "later", "after"]);
});

test("in the pregnancy, getting ready's open tasks still slip: folic acid matters at week 6", () => {
  const groups = groupTasks([task("folic-acid", BEFORE), task("dating-scan", wk(6))], {}, new Set(), wk(6), PREGNANCY);
  expect(ids(groups.slipped)).toEqual(["folic-acid"]);
  expect(ids(groups.now)).toEqual(["dating-scan"]);
});

test("once the baby's here, the pregnancy's open tasks are left behind, not slipped", () => {
  const groups = groupTasks([task("rsv", wk(30)), task("folic-acid", BEFORE), task("register", pp(2)), task("nurse", pp(3))], {}, new Set(), pp(3), NEWBORN);
  expect(ids(groups.behind)).toEqual(["folic-acid", "rsv"]);
  expect(ids(groups.slipped)).toEqual(["register"]);
  expect(ids(groups.now)).toEqual(["nurse"]);
});

test("getting ready plans now and once you're expecting, with no weeks to count", () => {
  const groups = groupTasks([task("cover", BEFORE), task("first-visit", wk(4)), task("register", pp(2))], { done: "t" }, new Set(), BEFORE, GETTING_READY);
  expect(ids(groups.now)).toEqual(["cover"]);
  expect(ids(groups.later)).toEqual(["first-visit", "register"]);
  expect(groups.soon).toEqual([]);
  expect(groups.slipped).toEqual([]);
});
