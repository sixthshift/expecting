// The Planner's to-do list: every task, grouped by when it matters against
// today. Pure, so the grouping is tested apart from the screen.
//
//   slipped  due before this week and not done
//   now      due this week
//   soon     due in the next four weeks
//   later    due after that (or, with no "now" yet, everything open)
//   done     ticked
//
// A task ticked during this visit stays where it was until the next one, so a
// tick never makes the row you just touched jump away.

import type { Task } from "../content/schema";
import { allSlots, compareSlots, type Slot, sameSlot } from "./timeline";

export type TaskGroup = "slipped" | "now" | "soon" | "later" | "done";

export const TASK_GROUPS: Record<TaskGroup, string> = {
  slipped: "Slipped",
  now: "This week",
  soon: "The next four weeks",
  later: "Later",
  done: "Done",
};

const SOON_WEEKS = 4;

export function groupTasks(
  tasks: readonly Task[],
  ticks: Record<string, string>,
  tickedHere: ReadonlySet<string>,
  now: Slot | null
): Record<TaskGroup, Task[]> {
  const groups: Record<TaskGroup, Task[]> = { slipped: [], now: [], soon: [], later: [], done: [] };
  const slots = allSlots();
  const nowIndex = now ? slots.findIndex((s) => sameSlot(s, now)) : -1;
  const soonEnd = nowIndex >= 0 ? slots[Math.min(slots.length - 1, nowIndex + SOON_WEEKS)]! : null;

  const sorted = [...tasks].sort((a, b) => compareSlots(a.due, b.due) || a.title.localeCompare(b.title));
  for (const task of sorted) {
    if (ticks[task.id] && !tickedHere.has(task.id)) groups.done.push(task);
    else if (!now) groups.later.push(task);
    else if (compareSlots(task.due, now) < 0) groups.slipped.push(task);
    else if (sameSlot(task.due, now)) groups.now.push(task);
    else if (soonEnd && compareSlots(task.due, soonEnd) <= 0) groups.soon.push(task);
    else groups.later.push(task);
  }
  return groups;
}
