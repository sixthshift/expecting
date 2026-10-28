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
import { allSlots, type Slot, slotKey } from "./timeline";

/** How many weeks ahead "now" looks: a task best done within them is on the list. */
export const HORIZON_WEEKS = 2;

/** How many weeks back it still looks: a task slipped (or a deadline missed) longer ago is left to the Planner. */
export const SLIPPED_WEEKS = 4;

export type Why = "deadline" | "slipped" | "soon";

export type ToDo = { task: Task; why: Why };

const ORDER: Record<Why, number> = { deadline: 0, slipped: 1, soon: 2 };

const position = new Map(allSlots().map((slot, i) => [slotKey(slot), i]));

/** A slot's place on the timeline, counted in weeks (getting ready is 0). */
function at(slot: Slot): number {
  return position.get(slotKey(slot))!;
}

/** The open, unticked tasks to do now, most urgent first. */
export function toDoNow(tasks: readonly Task[], ticks: Record<string, string>, now: Slot): ToDo[] {
  const today = at(now);
  const list: (ToDo & { when: number; i: number })[] = [];
  for (const [i, task] of tasks.entries()) {
    if (ticks[task.id] || at(task.opens) > today) continue;
    const recent = (slot: Slot) => today - at(slot) <= SLIPPED_WEEKS;
    if (task.deadline && at(task.deadline) - today <= HORIZON_WEEKS) {
      if (recent(task.deadline)) list.push({ task, why: "deadline", when: at(task.deadline), i });
    } else if (at(task.due) < today) {
      if (recent(task.due)) list.push({ task, why: "slipped", when: at(task.due), i });
    } else if (at(task.due) - today <= HORIZON_WEEKS) list.push({ task, why: "soon", when: at(task.due), i });
  }
  return list.sort((a, b) => ORDER[a.why] - ORDER[b.why] || a.when - b.when || a.i - b.i).map(({ task, why }) => ({ task, why }));
}
