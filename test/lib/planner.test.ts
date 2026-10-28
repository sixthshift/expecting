import { expect, test } from "vitest";
import type { Task } from "../../src/content/schema";
import { groupTasks } from "../../src/lib/planner";

const task = (id: string, due: number): Task => ({
  id,
  title: id,
  opens: 1,
  due,
  deadline: null,
  deadlineFrom: null,
  who: "together",
  itemId: null,
  origin: "own",
});
const ids = (tasks: Task[]) => tasks.map((t) => t.id);

const tasks = [task("later", 36), task("slipped", 25), task("now", 28), task("soon", 32)];

test("tasks group by when they matter against this week", () => {
  const groups = groupTasks(tasks, {}, new Set(), 28);
  expect(ids(groups.slipped)).toEqual(["slipped"]);
  expect(ids(groups.now)).toEqual(["now"]);
  expect(ids(groups.soon)).toEqual(["soon"]);
  expect(ids(groups.later)).toEqual(["later"]);
  expect(groups.done).toEqual([]);
});

test("a ticked task is done, unless it was ticked during this visit", () => {
  const ticks = { slipped: "t", now: "t" };
  const groups = groupTasks(tasks, ticks, new Set(["now"]), 28);
  expect(ids(groups.done)).toEqual(["slipped"]);
  expect(ids(groups.now)).toEqual(["now"]);
});

test("with no due date, every open task is simply to do, in order", () => {
  const groups = groupTasks(tasks, {}, new Set(), null);
  expect(ids(groups.later)).toEqual(["slipped", "now", "soon", "later"]);
});
