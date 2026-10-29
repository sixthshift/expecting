// To do now: what This week opens with. Pure, so the order is tested apart
// from the screen.
//
//   a task shows once it opens, and until it's ticked
//   first, a deadline coming up (or just missed): missing it costs something
//   then what has slipped past its best-by week lately, oldest first
//   then what is best done within the next couple of weeks, soonest first
//
// What slipped long ago is left to the Planner: joining at 28 weeks, the
// week-6 GP visit isn't what to do now.
//
// A task with a long lead time is best done early, so its best-by week brings
// it up early; nothing here needs to know the lead time itself.

import type { Task } from "../content/schema";
import { type Week, weekLabel } from "./timeline";

/** How many weeks ahead "now" looks: a task best done within them is on the list. */
export const HORIZON_WEEKS = 2;

/** How many weeks back it still looks: a task slipped (or a deadline missed) longer ago is left to the Planner. */
export const SLIPPED_WEEKS = 4;

export type Why = "deadline" | "slipped" | "soon";

export type ToDo = { task: Task; why: Why };

const week = (w: Week) => weekLabel(w).toLowerCase();

/** When, in a few words: "deadline week 30", "was due week 25", "this week", "by week 30". */
export function whenToDo({ task, why }: ToDo, now: Week): string {
  if (why === "deadline" && task.deadline !== null) {
    return task.deadline < now ? `deadline was ${week(task.deadline)}` : `deadline ${week(task.deadline)}`;
  }
  if (why === "slipped") return `was due ${week(task.due)}`;
  return task.due === now ? "this week" : `by ${week(task.due)}`;
}

const ORDER: Record<Why, number> = { deadline: 0, slipped: 1, soon: 2 };

/** The open, unticked tasks to do now, most urgent first. */
export function toDoNow(tasks: readonly Task[], ticks: Record<string, string>, today: Week): ToDo[] {
  const list: (ToDo & { when: number; i: number })[] = [];
  for (const [i, task] of tasks.entries()) {
    if (ticks[task.id] || task.opens > today) continue;
    const recent = (week: Week) => today - week <= SLIPPED_WEEKS;
    if (task.deadline !== null && task.deadline - today <= HORIZON_WEEKS) {
      if (recent(task.deadline)) list.push({ task, why: "deadline", when: task.deadline, i });
    } else if (task.due < today) {
      if (recent(task.due)) list.push({ task, why: "slipped", when: task.due, i });
    } else if (task.due - today <= HORIZON_WEEKS) list.push({ task, why: "soon", when: task.due, i });
  }
  return list.sort((a, b) => ORDER[a.why] - ORDER[b.why] || a.when - b.when || a.i - b.i).map(({ task, why }) => ({ task, why }));
}

/** How many weeks ahead Coming up looks, past To do now's horizon. */
export const AHEAD_WEEKS = 8;

export type Coming = { task: Task; week: Week; deadline: boolean };

/**
 * Coming up: the heads-up after To do now. An unticked task best done (or with
 * a deadline) after the next couple of weeks but within the next eight, by the
 * week it falls in, soonest first. Anything To do now has is left out.
 */
export function comingUp(tasks: readonly Task[], ticks: Record<string, string>, today: Week): Coming[] {
  const now = new Set(toDoNow(tasks, ticks, today).map((t) => t.task.id));
  const ahead = (week: Week) => week - today > HORIZON_WEEKS && week - today <= AHEAD_WEEKS;
  const list: (Coming & { i: number })[] = [];
  for (const [i, task] of tasks.entries()) {
    if (ticks[task.id] || now.has(task.id)) continue;
    if (ahead(task.due)) list.push({ task, week: task.due, deadline: false, i });
    else if (task.deadline !== null && ahead(task.deadline)) list.push({ task, week: task.deadline, deadline: true, i });
  }
  return list.sort((a, b) => a.week - b.week || a.i - b.i).map(({ task, week, deadline }) => ({ task, week, deadline }));
}
