import { expect, test } from "vitest";
import type { Task } from "../../src/content/schema";
import { comingUp, toDoNow } from "../../src/lib/todo";

function task(id: string, due: number, extra: Partial<Task> = {}): Task {
  return { id, title: id, opens: 1, due, deadline: null, deadlineFrom: null, who: "together", itemId: "i", origin: "built-in", ...extra };
}

const order = (tasks: Task[], now: number, ticks: Record<string, string> = {}) => toDoNow(tasks, ticks, now).map((t) => `${t.task.id}:${t.why}`);

test("a deadline coming up first, then what has slipped, then what is best done soon", () => {
  const tasks = [task("soon", 29), task("slipped-later", 26), task("deadline", 28, { deadline: 30 }), task("slipped-first", 24), task("far", 34)];
  expect(order(tasks, 28)).toEqual(["deadline:deadline", "slipped-first:slipped", "slipped-later:slipped", "soon:soon"]);
});

test("a task shows once it opens, and not before", () => {
  const notYet = task("claim", 30, { opens: 29 });
  expect(order([notYet], 28)).toEqual([]);
  expect(order([notYet], 29)).toEqual(["claim:soon"]);
});

test("a ticked task is done, deadline or not", () => {
  expect(order([task("t", 26, { deadline: 28 })], 28, { t: "2026-10-28T00:00:00Z" })).toEqual([]);
});

test("a deadline far off doesn't make it urgent; its best-by week still does", () => {
  expect(order([task("notice", 29, { deadline: 36 })], 28)).toEqual(["notice:soon"]);
  expect(order([task("notice", 27, { deadline: 36 })], 28)).toEqual(["notice:slipped"]);
});

test("a missed deadline stays at the top until it's ticked", () => {
  expect(order([task("late", 30), task("missed", 24, { deadline: 26 })], 29)).toEqual(["missed:deadline", "late:soon"]);
});

test("what slipped long ago is left to the Planner", () => {
  const tasks = [task("gp-visit", 6), task("recent", 24), task("old-deadline", 10, { deadline: 12 })];
  expect(order(tasks, 28)).toEqual(["recent:slipped"]);
});

const coming = (tasks: Task[], now: number, ticks: Record<string, string> = {}) =>
  comingUp(tasks, ticks, now).map((c) => `${c.task.id}:${c.week}${c.deadline ? "!" : ""}`);

test("coming up is what falls after To do now's horizon, within eight weeks, soonest first", () => {
  const tasks = [task("bag", 32), task("soon", 29), task("swab", 36), task("far", 37), task("past", 26)];
  expect(coming(tasks, 28)).toEqual(["bag:32", "swab:36"]);
});

test("coming up counts a deadline ahead when the best-by week has passed it by", () => {
  // Best by week 26 has slipped out of To do now's reach; its deadline is still ahead.
  expect(coming([task("claim", 20, { deadline: 34 })], 28)).toEqual(["claim:34!"]);
});

test("coming up leaves out what's ticked, and what To do now already has", () => {
  expect(coming([task("t", 32)], 28, { t: "2026-10-28T00:00:00Z" })).toEqual([]);
  expect(coming([task("notice", 33, { deadline: 30 })], 28)).toEqual([]);
});
