import { expect, test } from "vitest";
import type { Task } from "../../src/content/schema";
import { groupTasks } from "../../src/lib/planner";
import type { Slot } from "../../src/lib/timeline";

const wk = (week: number): Slot => ({ phase: "pregnancy", week });
const task = (id: string, due: Slot): Task => ({ id, title: id, due, itemId: null, origin: "own" });
const ids = (tasks: Task[]) => tasks.map((t) => t.id);

const tasks = [task("later", wk(36)), task("slipped", wk(25)), task("now", wk(28)), task("soon", wk(32)), task("after", { phase: "postpartum", week: 1 })];

test("tasks group by when they matter against this week", () => {
  const groups = groupTasks(tasks, {}, new Set(), wk(28));
  expect(ids(groups.slipped)).toEqual(["slipped"]);
  expect(ids(groups.now)).toEqual(["now"]);
  expect(ids(groups.soon)).toEqual(["soon"]);
  expect(ids(groups.later)).toEqual(["later", "after"]);
  expect(groups.done).toEqual([]);
});

test("a ticked task is done, unless it was ticked during this visit", () => {
  const ticks = { slipped: "t", now: "t" };
  const groups = groupTasks(tasks, ticks, new Set(["now"]), wk(28));
  expect(ids(groups.done)).toEqual(["slipped"]);
  expect(ids(groups.now)).toEqual(["now"]);
});

test("with no due date, every open task is simply to do, in order", () => {
  const groups = groupTasks(tasks, {}, new Set(), null);
  expect(ids(groups.later)).toEqual(["slipped", "now", "soon", "later", "after"]);
});
