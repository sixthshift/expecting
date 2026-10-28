// The Planner's to-do list: every task, grouped by when it matters against
// today. Pure, so the grouping is tested apart from the screen. Each phase's
// app says how it plans (src/features/phases/<phase>/index.ts):
//
//   by week, the pregnancy and the newborn
//     slipped  due before this week and not done
//     now      due this week
//     soon     due in the next four weeks
//     later    due after that (or, with no "now" yet, everything open)
//   getting ready, which has no weeks to count yet
//     now      due before a pregnancy
//     later    due once you're expecting
//   and in either
//     behind   left open in an earlier phase, when the phase plans only its own
//     done     ticked
//
// A task ticked during this visit stays where it was until the next one, so a
// tick never makes the row you just touched jump away.

import type { Task } from "../content/schema";
import { allSlots, comparePhases, compareSlots, type Slot, sameSlot } from "./timeline";

export type TaskGroup = "slipped" | "now" | "soon" | "later" | "behind" | "done";

/** How a phase plans its tasks. */
export type PlannerPlan = {
  /** By week against today, or getting ready's now and once you're expecting. */
  grouping: "weeks" | "getting-ready";
  /**
   * Whether open tasks from earlier phases are still to do (and so slip), or
   * are left behind. The pregnancy keeps getting ready's: folic acid still
   * matters at week 6. The newborn leaves the pregnancy's: an RSV vaccine
   * can't be had after the birth.
   */
  earlier: "slip" | "leave-behind";
};

/** Each group's heading, by grouping. `behind` is named by the phase that left them: "From the pregnancy". */
export const GROUP_TITLES: Record<PlannerPlan["grouping"], Record<Exclude<TaskGroup, "behind">, string>> = {
  weeks: { slipped: "Slipped", now: "This week", soon: "The next four weeks", later: "Later", done: "Done" },
  "getting-ready": { slipped: "Slipped", now: "Now", soon: "Soon", later: "Once you're expecting", done: "Done" },
};

const SOON_WEEKS = 4;

export function groupTasks(
  tasks: readonly Task[],
  ticks: Record<string, string>,
  tickedHere: ReadonlySet<string>,
  now: Slot | null,
  plan: PlannerPlan
): Record<TaskGroup, Task[]> {
  const groups: Record<TaskGroup, Task[]> = { slipped: [], now: [], soon: [], later: [], behind: [], done: [] };
  const slots = allSlots();
  const nowIndex = now ? slots.findIndex((s) => sameSlot(s, now)) : -1;
  const soonEnd = nowIndex >= 0 ? slots[Math.min(slots.length - 1, nowIndex + SOON_WEEKS)]! : null;

  const sorted = [...tasks].sort((a, b) => compareSlots(a.due, b.due) || a.title.localeCompare(b.title));
  for (const task of sorted) {
    if (ticks[task.id] && !tickedHere.has(task.id)) groups.done.push(task);
    else if (!now) groups.later.push(task);
    else if (plan.earlier === "leave-behind" && comparePhases(task.due.phase, now.phase) < 0) groups.behind.push(task);
    else if (plan.grouping === "getting-ready") groups[task.due.phase === "preconception" ? "now" : "later"].push(task);
    else if (compareSlots(task.due, now) < 0) groups.slipped.push(task);
    else if (sameSlot(task.due, now)) groups.now.push(task);
    else if (soonEnd && compareSlots(task.due, soonEnd) <= 0) groups.soon.push(task);
    else groups.later.push(task);
  }
  return groups;
}
