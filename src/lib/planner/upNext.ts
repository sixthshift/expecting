// The Planner's Up next, on a desktop: what's coming, appointments and tasks
// together, a week at a time from this one. Pure, so it's tested apart from
// the screen. Lists have no dates, so they aren't on it; a line with a task is
// here as its task.
//
//   this week   its appointments still ahead; next up and the rest of To do
//               now; anything else that asks of you this week
//   each after  its appointments, and the tasks that next ask of you then
//               (open, best by or a deadline: the plan's `ahead`)
//
// A later week with nothing in it is left out, so it reads as what's next,
// not as a calendar. What's further off is in Across the weeks.

import type { ISODate } from "../dates";
import { WEEKS, type Week } from "../timeline";
import { type Appointment, appointmentsIn } from "./appointments";
import type { Ahead, Plan } from "./plan";
import type { ToDo } from "./todo";

/** How many weeks Up next looks ahead, this one included. */
const UP_NEXT_WEEKS = 4;

export type UpNextWeek = {
  week: Week;
  /** Its appointments still ahead, earliest first. */
  appointments: Appointment[];
  /** To do now: next up, then the rest, in To do's order. This week only. */
  now: ToDo[];
  /** What else next asks of you that week. */
  ahead: Ahead[];
};

/**
 * The weeks of Up next: this one always, then each after it with something
 * in it, to `UP_NEXT_WEEKS` in all and never past week 42. `appointments` are
 * those still ahead.
 */
export function upNext(plan: Plan, appointments: readonly Appointment[], now: Week, dueDate: ISODate): UpNextWeek[] {
  const weeks: UpNextWeek[] = [];
  const last = Math.min(now + UP_NEXT_WEEKS - 1, WEEKS.last) as Week;
  for (let w = now; w <= last; w++) {
    const week = w as Week;
    const entry: UpNextWeek = {
      week,
      appointments: appointmentsIn(appointments, week, dueDate),
      now: week === now ? [...(plan.next ? [plan.next] : []), ...plan.now] : [],
      ahead: plan.ahead.filter((a) => a.week === week),
    };
    if (week === now || entry.appointments.length > 0 || entry.ahead.length > 0) weeks.push(entry);
  }
  return weeks;
}
