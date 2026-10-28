// The Planner's to-do list: every task, grouped by when it matters against
// this week. Pure, so the grouping is tested apart from the screen.
//
//   slipped  due before this week and not done
//   now      due this week
//   soon     due in the next four weeks
//   later    due after that (or, with no due date yet, everything open)
//   done     ticked
//
// A task ticked during this visit stays where it was until the next one, so a
// tick never makes the row you just touched jump away.

import type { Task } from "../content/schema";
import type { Week } from "./timeline";

export type TaskGroup = "slipped" | "now" | "soon" | "later" | "done";

export const GROUP_TITLES: Record<TaskGroup, string> = {
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
  now: Week | null
): Record<TaskGroup, Task[]> {
  const groups: Record<TaskGroup, Task[]> = { slipped: [], now: [], soon: [], later: [], done: [] };
  const sorted = [...tasks].sort((a, b) => a.due - b.due || a.title.localeCompare(b.title));
  for (const task of sorted) {
    if (ticks[task.id] && !tickedHere.has(task.id)) groups.done.push(task);
    else if (now === null) groups.later.push(task);
    else if (task.due < now) groups.slipped.push(task);
    else if (task.due === now) groups.now.push(task);
    else if (task.due <= now + SOON_WEEKS) groups.soon.push(task);
    else groups.later.push(task);
  }
  return groups;
}
