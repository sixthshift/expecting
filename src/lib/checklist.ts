// The checklist: every built-in task plus our own, in timeline order.

import type { Task } from "../content/schema";
import type { OwnTaskRow } from "../db/models/checklist/repo";
import { compareSlots, type Slot } from "./timeline";

export function ownTaskToTask(row: OwnTaskRow): Task {
  const due: Slot = row.phase === "before" || row.week === null ? { phase: "before" } : { phase: row.phase, week: row.week };
  return { id: row.id, title: row.title, due, itemId: null, origin: "own" };
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
