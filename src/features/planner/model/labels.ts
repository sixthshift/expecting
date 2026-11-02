// The Planner's own words: when a task ahead next asks of you, when a missed
// one was due, how To do is going, and what a bar on the chart says. How
// days and weeks are said is src/lib/labels.ts.

import type { Task } from "../../../content/schema";
import type { Bar, BarState } from "../../../lib/acrossTheWeeks";
import { weekInSentence } from "../../../lib/labels";
import type { Ahead } from "../../../lib/planner";

const AHEAD_AT: Record<Ahead["at"], string> = { opens: "opens", due: "by", deadline: "deadline" };

/** When a task ahead next asks of you: "opens week 30", "by week 32", "deadline week 34". */
export function aheadWhen({ week, at }: Ahead): string {
  return `${AHEAD_AT[at]} ${weekInSentence(week)}`;
}

/** When a task missed earlier was due: "was due week 12". */
export function missedWhen(task: Task): string {
  return `was due ${weekInSentence(task.due)}`;
}

/** After "12 of 40 done": how close the deadlines are, or that nothing's urgent; nothing without a due date. */
export function toDoSoFar(deadlines: number, nextUp: boolean): string {
  if (deadlines > 0) return ` · ${deadlines === 1 ? "a deadline" : `${deadlines} deadlines`} close`;
  return nextUp ? " · nothing urgent" : " · nothing to do right now";
}

const BAR_STATE: Record<BarState, string> = { open: "open now", ahead: "ahead", late: "past its best-by week", done: "done" };

/** A bar, read out: "Book the scan: opens week 18, best by week 20, closes week 22, open now". */
export function barLabel({ task, from, due, to, state }: Bar): string {
  return `${task.title}: opens ${weekInSentence(from)}, best by ${weekInSentence(due)}, closes ${weekInSentence(to)}, ${BAR_STATE[state]}`;
}
