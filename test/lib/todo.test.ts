import { expect, test } from "vitest";
import type { Task } from "../../src/content/schema";
import type { Slot } from "../../src/lib/timeline";
import { toDoNow } from "../../src/lib/todo";

const wk = (week: number): Slot => ({ phase: "pregnancy", week });
const pp = (week: number): Slot => ({ phase: "postpartum", week });

function task(id: string, due: Slot, extra: Partial<Task> = {}): Task {
  return { id, title: id, opens: { phase: "preconception" }, due, deadline: null, who: "together", itemId: "i", origin: "built-in", ...extra };
}

const order = (tasks: Task[], now: Slot, ticks: Record<string, string> = {}) => toDoNow(tasks, ticks, now).map((t) => `${t.task.id}:${t.why}`);

test("a deadline coming up first, then what has slipped, then what is best done soon", () => {
  const tasks = [
    task("soon", wk(29)),
    task("slipped-later", wk(26)),
    task("deadline", wk(28), { deadline: wk(30) }),
    task("slipped-first", wk(24)),
    task("far", wk(34)),
  ];
  expect(order(tasks, wk(28))).toEqual(["deadline:deadline", "slipped-first:slipped", "slipped-later:slipped", "soon:soon"]);
});

test("a task shows once it opens, and not before", () => {
  const notYet = task("claim", wk(30), { opens: wk(29) });
  expect(order([notYet], wk(28))).toEqual([]);
  expect(order([notYet], wk(29))).toEqual(["claim:soon"]);
});

test("a ticked task is done, deadline or not", () => {
  expect(order([task("t", wk(26), { deadline: wk(28) })], wk(28), { t: "2026-10-28T00:00:00Z" })).toEqual([]);
});

test("a deadline far off doesn't make it urgent; its best-by week still does", () => {
  expect(order([task("notice", wk(29), { deadline: wk(36) })], wk(28))).toEqual(["notice:soon"]);
  expect(order([task("notice", wk(27), { deadline: wk(36) })], wk(28))).toEqual(["notice:slipped"]);
});

test("a missed deadline stays at the top until it's ticked", () => {
  expect(order([task("late", wk(30)), task("missed", wk(24), { deadline: wk(26) })], wk(29))).toEqual(["missed:deadline", "late:soon"]);
});

test("what slipped long ago is left to the Planner", () => {
  const tasks = [task("gp-visit", wk(6)), task("recent", wk(24)), task("old-deadline", wk(10), { deadline: wk(12) })];
  expect(order(tasks, wk(28))).toEqual(["recent:slipped"]);
  expect(order([task("from-before", { phase: "preconception" })], wk(3))).toEqual(["from-before:slipped"]);
});

test("the weeks run on across the birth", () => {
  expect(order([task("register", pp(6), { opens: pp(1), deadline: pp(8) })], pp(6))).toEqual(["register:deadline"]);
  expect(order([task("after", pp(1))], wk(41))).toEqual(["after:soon"]);
});
