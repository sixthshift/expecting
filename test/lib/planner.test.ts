import { expect, test } from "vitest";
import type { Task } from "../../src/content/schema";
import { planTasks, stagesAhead } from "../../src/lib/planner";

function task(id: string, due: number, extra: Partial<Task> = {}): Task {
  return { id, title: id, opens: 1, due, deadline: null, deadlineFrom: null, who: "together", keeps: null, itemId: null, origin: "own", ...extra };
}
const ids = (tasks: { task: Task }[]) => tasks.map((t) => t.task.id);

const tasks = [
  task("far", 36),
  task("long-ago", 10),
  task("slipped", 26),
  task("deadline", 29, { deadline: 29 }),
  task("not-open", 31, { opens: 30 }),
  task("this-week", 28),
];

test("next up is the most urgent, then the rest of what to do now, in order", () => {
  const plan = planTasks(tasks, {}, new Set(), 28);
  expect(plan.next?.task.id).toBe("deadline");
  expect(ids(plan.now)).toEqual(["slipped", "this-week"]);
});

test("everything else ahead is by the week it next asks of you", () => {
  const plan = planTasks(tasks, {}, new Set(), 28);
  expect(plan.ahead.map((a) => `${a.task.id}:${a.at}${a.week}`)).toEqual(["not-open:opens30", "far:due36"]);
});

test("what slipped long ago is earlier, unless its deadline is still ahead", () => {
  const plan = planTasks([...tasks, task("notice", 12, { deadline: 34 })], {}, new Set(), 28);
  expect(plan.earlier.map((t) => t.id)).toEqual(["long-ago"]);
  expect(plan.ahead.map((a) => `${a.task.id}:${a.at}${a.week}`)).toContain("notice:deadline34");
});

test("ticking next up brings up the next; a row ticked this visit stays where it was", () => {
  const ticks = { deadline: "t", "this-week": "t" };
  const plan = planTasks(tasks, ticks, new Set(["this-week"]), 28);
  expect(plan.next?.task.id).toBe("slipped");
  expect(ids(plan.now)).toEqual(["this-week"]);
  expect(plan.done.map((t) => t.id)).toEqual(["deadline"]);
  expect(plan.progress).toEqual({ done: 2, total: 6 });
});

test("a task ticked this visit is never next up", () => {
  const plan = planTasks(tasks, { deadline: "t" }, new Set(["deadline"]), 28);
  expect(plan.next?.task.id).toBe("slipped");
  expect(ids(plan.now)).toEqual(["deadline", "this-week"]);
});

test("with no due date, every open task is simply ahead, by its best-by week", () => {
  const plan = planTasks(tasks, {}, new Set(), null);
  expect(plan.next).toBeNull();
  expect(plan.ahead.map((a) => a.task.id)).toEqual(["long-ago", "slipped", "this-week", "deadline", "not-open", "far"]);
});

test("what's ahead is put into stages, each ending at a week people mark", () => {
  const ahead = [task("bag", 36), task("claim", 31, { opens: 30 }), task("notice", 12, { deadline: 34 }), task("feeding", 39), task("seat", 36)];
  const stages = stagesAhead(planTasks(ahead, { seat: "t", "long-done": "t" }, new Set(), 28));
  expect(stages.map((s) => `${s.end}:${s.ahead.map((a) => a.task.id).join(",")}`)).toEqual(["32:claim", "37:notice,bag", "42:feeding"]);
  expect(stages[1]?.done.map((t) => t.id)).toEqual(["seat"]);
});

test("a stage with nothing left to do isn't shown, ticked or not", () => {
  const stages = stagesAhead(planTasks([task("seat", 36), task("feeding", 39)], { seat: "t" }, new Set(), 28));
  expect(stages.map((s) => s.end)).toEqual([42]);
});
