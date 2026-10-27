// What the timeline shows: one band per week. Pure, so the rules about what
// appears where are tested apart from the screen.
//
//   every week, from getting ready to 12 weeks after the birth
//   each item once, in the week it starts; standalone tasks in their due week
//   asked questions in the week they were asked: behind today, the diary
//   the current week also carries what is still relevant and what has slipped
//
// The timeline has no views: To do and questions live in the Planner, "nobody
// tells you" in the Library. The timeline is where they meet in time.

import type { Item, Task } from "../content/schema";
import { overdue } from "./checklist";
import type { ISODate } from "./dates";
import type { Question } from "./questions";
import { allSlots, compareSlots, positionOn, type Slot, sameSlot, slotKey } from "./timeline";

export type Band = {
  slot: Slot;
  key: string;
  isNow: boolean;
  isPast: boolean;
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
  items: readonly Item[];
  tasks: readonly Task[];
  ticks: Record<string, string>;
  questions: readonly Question[];
  now: Slot | null;
  dueDate: ISODate | null;
  birthDate: ISODate | null;
};

export function buildBands(input: TimelineInput): Band[] {
  const { items, tasks, ticks, questions, now } = input;
  const isOpen = (t: Task) => !ticks[t.id];
  const askedAt = askedSlots(input);

  return allSlots().map((slot): Band => {
    const isNow = now !== null && sameSlot(slot, now);
    const due = tasks.filter((t) => sameSlot(t.due, slot));
    const starting = items.filter((i) => sameSlot(i.from, slot));
    return {
      slot,
      key: slotKey(slot),
      isNow,
      isPast: now !== null && compareSlots(slot, now) < 0,
      starting,
      continuing: isNow ? items.filter((i) => compareSlots(i.from, slot) < 0 && compareSlots(slot, i.to) <= 0) : [],
      tasks: due.filter((t) => t.itemId === null),
      slipped: isNow && now ? overdue(tasks, ticks, now) : [],
      asked: questions.filter((q) => askedAt.get(q.id) === slotKey(slot)),
      openTasks: due.filter(isOpen).length,
    };
  });
}

/** The week each asked question was asked in, by question id. Empty without a due date. */
function askedSlots({ questions, dueDate, birthDate }: TimelineInput): Map<string, string> {
  const at = new Map<string, string>();
  if (!dueDate) return at;
  for (const q of questions) {
    if (q.askedAt) at.set(q.id, slotKey(positionOn(q.askedAt.slice(0, 10) as ISODate, dueDate, birthDate).slot));
  }
  return at;
}

/** What the ruler marks at each week: how much starts, and whether anything has slipped. */
export type Mark = { slot: Slot; key: string; starting: number; overdue: boolean; isNow: boolean };

export function rulerMarks(items: readonly Item[], tasks: readonly Task[], ticks: Record<string, string>, now: Slot | null): Mark[] {
  return allSlots().map((slot) => ({
    slot,
    key: slotKey(slot),
    starting: items.filter((i) => sameSlot(i.from, slot)).length,
    overdue: now !== null && compareSlots(slot, now) < 0 && tasks.some((t) => sameSlot(t.due, slot) && !ticks[t.id]),
    isNow: now !== null && sameSlot(slot, now),
  }));
}
