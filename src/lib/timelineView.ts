// What the timeline shows: one band per week. Pure, so the rules about what
// appears where are tested apart from the screen.
//
//   every week of the pregnancy, 1 to 42
//   each week's note, where it has one
//   each item once, in the week it starts; standalone tasks in their due week
//   asked questions in the week they were asked: behind today, the diary
//   the current week also carries what is still relevant and what has slipped
//
// The timeline has no views: To do and questions live in the Planner, "nobody
// tells you" in the Library. The timeline is where they meet in time.

import type { Item, Task } from "../content/schema";
import type { WeekNote } from "../content/weeks";
import { overdue } from "./checklist";
import { type ISODate, todayISO } from "./dates";
import type { Question } from "./questions";
import { allWeeks, positionOn, type Week } from "./timeline";

export type Band = {
  week: Week;
  isNow: boolean;
  isPast: boolean;
  /** This week's note: the baby, the body, the partner. */
  note: WeekNote | null;
  /** Items that start this week. */
  starting: Item[];
  /** Items still running from an earlier week. Only on the current week. */
  continuing: Item[];
  /** Standalone tasks due this week; an item's tasks stay in its card. */
  tasks: Task[];
  /** Tasks due before this week and not done. Only on the current week. */
  slipped: Task[];
  /** Asked questions, in the week they were asked. */
  asked: Question[];
  /** Open tasks due this week, built-in and own: the number a folded band shows. */
  openTasks: number;
};

export type TimelineInput = {
  notes: readonly WeekNote[];
  items: readonly Item[];
  tasks: readonly Task[];
  ticks: Record<string, string>;
  questions: readonly Question[];
  now: Week | null;
  dueDate: ISODate | null;
};

export function buildBands(input: TimelineInput): Band[] {
  const { notes, items, tasks, ticks, questions, now } = input;
  const isOpen = (t: Task) => !ticks[t.id];
  const askedAt = askedWeeks(input);

  return allWeeks().map((week): Band => {
    const isNow = week === now;
    const due = tasks.filter((t) => t.due === week);
    return {
      week,
      isNow,
      isPast: now !== null && week < now,
      note: notes.find((n) => n.week === week) ?? null,
      starting: items.filter((i) => i.from === week),
      continuing: isNow ? items.filter((i) => i.from < week && week <= i.to) : [],
      tasks: due.filter((t) => t.itemId === null),
      slipped: isNow ? overdue(tasks, ticks, week) : [],
      asked: questions.filter((q) => askedAt.get(q.id) === week),
      openTasks: due.filter(isOpen).length,
    };
  });
}

/** The week each asked question was asked in, by question id. Empty without a due date. */
function askedWeeks({ questions, dueDate }: TimelineInput): Map<string, Week> {
  const at = new Map<string, Week>();
  if (!dueDate) return at;
  for (const q of questions) {
    if (q.askedAt) at.set(q.id, positionOn(todayISO(new Date(q.askedAt)), dueDate).week);
  }
  return at;
}

/** What the ruler marks at each week: how much starts, and whether anything has slipped. */
export type Mark = { week: Week; starting: number; overdue: boolean; isNow: boolean };

export function rulerMarks(items: readonly Item[], tasks: readonly Task[], ticks: Record<string, string>, now: Week | null): Mark[] {
  return allWeeks().map((week) => ({
    week,
    starting: items.filter((i) => i.from === week).length,
    overdue: now !== null && week < now && tasks.some((t) => t.due === week && !ticks[t.id]),
    isNow: week === now,
  }));
}
