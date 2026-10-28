// The checklist: every built-in task plus our own, in timeline order.

import type { Task } from "../content/schema";
import type { Week } from "./timeline";

/** A task of our own, as stored: a week. */
export type OwnTaskRow = { id: string; title: string; week: Week; createdAt: string };

/** An own task can be done any time up to its week, has no hard deadline, and is both of yours. */
export function ownTaskToTask(row: OwnTaskRow): Task {
  return { id: row.id, title: row.title, opens: 1, due: row.week, deadline: null, deadlineFrom: null, who: "together", itemId: null, origin: "own" };
}

/** Built-in and own tasks together, by due week; ties keep built-in order, then own tasks. */
export function buildChecklist(builtIn: readonly Task[], own: readonly OwnTaskRow[]): Task[] {
  const all = [...builtIn, ...own.map(ownTaskToTask)];
  return all
    .map((task, i) => ({ task, i }))
    .sort((a, b) => a.task.due - b.task.due || a.i - b.i)
    .map(({ task }) => task);
}

/** Unticked tasks due before `now`. */
export function overdue(tasks: readonly Task[], ticks: Record<string, string>, now: Week): Task[] {
  return tasks.filter((t) => !ticks[t.id] && t.due < now);
}
