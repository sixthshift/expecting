// What's to do, across the weeks: the Planner's chart. Every task a bar, from
// the week it opens to the week it closes, with a notch at its best-by week,
// grouped as To do is (src/lib/planner.ts), so the chart and the list are one
// plan drawn two ways:
//
//   now      To do now: Next up and Also now
//   stages   what's ahead, a group per stage, each ending at a week people mark
//   earlier  missed long ago, and done: folded
//
// A task closes at its deadline, else where its item's weeks end, and never
// before its best-by week. Pure, so it's tested apart from the screen.

import type { Task } from "../content/schema";
import type { Plan, Stage } from "./planner";
import { WEEKS, type Week } from "./timeline";

/** Where a task stands today: open now, still to open, past its best-by week, or done. */
export type BarState = "open" | "ahead" | "late" | "done";

export type Bar = { task: Task; from: Week; due: Week; to: Week; state: BarState };

export type BarGroup = { key: "now"; title: string; bars: Bar[] } | { key: number; title: string; start: Week; end: Week; bars: Bar[] };

export type Chart = { groups: BarGroup[]; earlier: Bar[] };

const clamp = (w: number): Week => Math.min(WEEKS.last, Math.max(WEEKS.first, w));

/** One task's bar: its weeks and where it stands. `itemEnd` is the last week of the item it belongs to. */
export function barOf(task: Task, ticked: boolean, now: Week | null, itemEnd: Week | null): Bar {
  const from = clamp(Math.min(task.opens, task.due));
  const due = clamp(task.due);
  const to = clamp(Math.max(due, task.deadline ?? itemEnd ?? due));
  const state: BarState = ticked ? "done" : now === null || now < from ? "ahead" : now > due ? "late" : "open";
  return { task, from, due, to, state };
}

/** The plan as a chart: To do now, then a group per stage ahead, then what's earlier and done. */
export function chartOf(plan: Plan, stages: readonly Stage[], ticks: Record<string, string>, now: Week | null, itemEnd: (task: Task) => Week | null): Chart {
  const bar = (task: Task) => barOf(task, Boolean(ticks[task.id]), now, itemEnd(task));
  const toDoNow = [plan.next, ...plan.now].filter((t) => t !== null).map((t) => bar(t.task));
  const groups: BarGroup[] = [
    ...(toDoNow.length > 0 ? [{ key: "now" as const, title: "To do now", bars: toDoNow }] : []),
    ...stages.map((s) => ({ key: s.end, title: s.title, start: s.start, end: s.end, bars: s.ahead.map((a) => bar(a.task)) })),
  ];
  const earlier = [...plan.earlier, ...plan.done].map(bar).sort((a, b) => a.from - b.from || a.due - b.due);
  return { groups, earlier };
}
