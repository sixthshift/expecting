// What the timeline shows: one band per week, shaped by the view. Pure, so the
// rules about what appears where are tested apart from the screen.
//
//   all        every week; each item once, in the week it starts; standalone
//              tasks in their due week; the current week also carries what is
//              still relevant and what has slipped
//   todo       only weeks with an open task, each showing just its tasks
//   surprise   only weeks where a "nobody tells you" item starts
//   questions  open questions sit at the current week; asked ones in the week
//              they were asked
//
// The current week is always present, whatever the view, so "now" never vanishes.

import type { Item, Task } from "../content/schema";
import type { Question } from "../db/models/questions/repo";
import { overdue } from "./checklist";
import type { ISODate } from "./dates";
import { allSlots, compareSlots, positionOn, type Slot, sameSlot, slotKey } from "./timeline";

export const VIEWS = {
  all: "Everything",
  todo: "To do",
  surprise: "Nobody tells you",
  questions: "Questions",
} as const;

export type View = keyof typeof VIEWS;

export type Band = {
  slot: Slot;
  key: string;
  isNow: boolean;
  isPast: boolean;
  /** Items that start this week. */
  starting: Item[];
  /** Items still running from an earlier week. Only on the current week, in `all`. */
  continuing: Item[];
  /** Tasks shown loose in this band: standalone tasks in `all`, every open task in `todo`. */
  tasks: Task[];
  /** Tasks due before this week and not done. Only on the current week, in `all`. */
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
  /** Ticked during this visit: they stay in `todo` until the next one. */
  tickedHere: ReadonlySet<string>;
  questions: readonly Question[];
  now: Slot | null;
  dueDate: ISODate | null;
  birthDate: ISODate | null;
  view: View;
};

export function buildBands(input: TimelineInput): Band[] {
  const { items, tasks, ticks, tickedHere, questions, now, view } = input;
  const isOpen = (t: Task) => !ticks[t.id];
  const askedAt = askedSlots(input);

  const bands = allSlots().map((slot): Band => {
    const isNow = now !== null && sameSlot(slot, now);
    const due = tasks.filter((t) => sameSlot(t.due, slot));
    const starting = items.filter((i) => sameSlot(i.from, slot));
    return {
      slot,
      key: slotKey(slot),
      isNow,
      isPast: now !== null && compareSlots(slot, now) < 0,
      starting: view === "surprise" ? starting.filter((i) => i.surprise) : view === "all" ? starting : [],
      continuing: view === "all" && isNow ? items.filter((i) => compareSlots(i.from, slot) < 0 && compareSlots(slot, i.to) <= 0) : [],
      tasks: view === "all" ? due.filter((t) => t.itemId === null) : view === "todo" ? due.filter((t) => isOpen(t) || tickedHere.has(t.id)) : [],
      slipped: view === "all" && isNow && now ? overdue(tasks, ticks, now) : [],
      asked: view === "questions" ? questions.filter((q) => askedAt.get(q.id) === slotKey(slot)) : [],
      openTasks: due.filter(isOpen).length,
    };
  });

  if (view === "all") return bands;
  return bands.filter((b) => b.isNow || b.starting.length > 0 || b.tasks.length > 0 || b.asked.length > 0);
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
