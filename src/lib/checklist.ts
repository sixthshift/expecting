// The checklist: every built-in task plus our own, in timeline order.

import type { Task } from "../content/schema";
import { compareSlots, type Phase, type Slot } from "./timeline";

/** A task of our own, as stored: a phase and, outside preconception, a week. */
export type OwnTaskRow = { id: string; title: string; phase: Phase; week: number | null; createdAt: string };

/** An own task can be done any time up to its week, has no hard deadline, and is both of yours. */
export function ownTaskToTask(row: OwnTaskRow): Task {
  const due: Slot = row.phase === "preconception" || row.week === null ? { phase: "preconception" } : { phase: row.phase, week: row.week };
  return { id: row.id, title: row.title, opens: { phase: "preconception" }, due, deadline: null, who: "together", itemId: null, origin: "own" };
}

/** Built-in and own tasks together, by due slot; ties keep built-in order, then own tasks. */
export function buildChecklist(builtIn: readonly Task[], own: readonly OwnTaskRow[]): Task[] {
  const all = [...builtIn, ...own.map(ownTaskToTask)];
  return all
    .map((task, i) => ({ task, i }))
    .sort((a, b) => compareSlots(a.task.due, b.task.due) || a.i - b.i)
    .map(({ task }) => task);
}

/** Unticked tasks due before `now`. */
export function overdue(tasks: readonly Task[], ticks: Record<string, string>, now: Slot): Task[] {
  return tasks.filter((t) => !ticks[t.id] && compareSlots(t.due, now) < 0);
}
