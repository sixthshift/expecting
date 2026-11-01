import { expect, test } from "vitest";
import type { Task } from "../../src/content/schema";
import { barOf, chartOf } from "../../src/lib/acrossTheWeeks";
import { planTasks, stageEnding, stagesAhead } from "../../src/lib/planner";

function task(id: string, due: number, extra: Partial<Task> = {}): Task {
  return { id, title: id, opens: 1, due, deadline: null, deadlineFrom: null, who: "together", keeps: null, itemId: null, origin: "own", ...extra };
}

test("a bar runs from when it opens to its deadline, else its item's end, never closing before its best-by week", () => {
  expect(barOf(task("a", 30, { opens: 27, deadline: 36 }), false, 28, 40)).toMatchObject({ from: 27, due: 30, to: 36 });
  expect(barOf(task("b", 30, { opens: 27 }), false, 28, 34)).toMatchObject({ from: 27, due: 30, to: 34 });
  expect(barOf(task("c", 30, { opens: 27 }), false, 28, null)).toMatchObject({ to: 30 });
  expect(barOf(task("d", 30, { opens: 27 }), false, 28, 20)).toMatchObject({ to: 30 });
});

test("where a bar stands: done when ticked, else ahead, open or late by today", () => {
  const t = task("a", 30, { opens: 27, deadline: 36 });
  expect(barOf(t, true, 28, null).state).toBe("done");
  expect(barOf(t, false, 26, null).state).toBe("ahead");
  expect(barOf(t, false, 28, null).state).toBe("open");
  expect(barOf(t, false, 32, null).state).toBe("late");
  expect(barOf(t, false, null, null).state).toBe("ahead");
});

test("the chart is the plan: to do now, a group per stage ahead, then earlier and done", () => {
  const tasks = [task("far", 36), task("long-ago", 10), task("ticked", 12), task("this-week", 28), task("not-open", 31, { opens: 30 })];
  const ticks = { ticked: "2026-01-01" };
  const plan = planTasks(tasks, ticks, new Set(), 28);
  const chart = chartOf(plan, stagesAhead(plan), ticks, 28, () => null);
  expect(chart.groups.map((g) => [g.key, g.bars.map((b) => b.task.id)])).toEqual([
    ["now", ["this-week"]],
    [32, ["not-open"]],
    [37, ["far"]],
  ]);
  expect(chart.earlier.map((b) => b.task.id)).toEqual(["long-ago", "ticked"]);
});

test("a stage's address is the week it ends, and it knows where it starts", () => {
  expect(stageEnding(32)).toEqual({ start: 28, end: 32, title: "By 32 weeks" });
  expect(stageEnding(13)?.start).toBe(1);
  expect(stageEnding(30)).toBeNull();
});
