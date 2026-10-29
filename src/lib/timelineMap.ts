// The timeline as a map: the whole pregnancy at once. Pure, so what it shows
// is tested apart from the screen.
//
//   every week, 1 to 42, one line each: its note's title or a landmark, what
//   opens, what's to do, what's done; a week's detail is This week's (/?at=)
//   the windows: each item that asks something of you, drawn across its weeks,
//   so what overlaps and what's open now can be seen at a glance
//   landmarks: the moments people mark, halfway, full term, the due date

import { asks, type DatedItem, type Item, type Task } from "../content/schema";
import type { WeekNote } from "../content/weeks";
import { type ISODate, todayISO } from "./dates";
import type { Question } from "./questions";
import { allWeeks, positionOn, type Week } from "./timeline";

/** The weeks people mark. The trimesters are the map's chapters, not landmarks. */
export const LANDMARKS: Readonly<Record<Week, string>> = { 20: "Halfway", 37: "Full term", 40: "Due date" };

/** Where the pregnancy changes chapter. */
export function trimester(week: Week): 1 | 2 | 3 {
  return week <= 13 ? 1 : week <= 27 ? 2 : 3;
}

export const TRIMESTERS = { 1: "First trimester", 2: "Second trimester", 3: "Third trimester" } as const;

/** Where a window stands today: behind, open now, ahead, or done (every task ticked). */
export type WindowState = "past" | "open" | "ahead" | "done";

/** An item that asks something of you, across its weeks. */
export type MapWindow = { item: DatedItem; from: Week; to: Week; state: WindowState };

export function mapWindows(items: readonly Item[], ticks: Record<string, string>, now: Week | null): MapWindow[] {
  const asking = items.filter(asks).sort((a, b) => a.from - b.from || a.to - b.to);
  return asking.map((item) => {
    const done = item.tasks.every((t) => ticks[t.id]);
    const state: WindowState = done ? "done" : now === null || now < item.from ? "ahead" : now > item.to ? "past" : "open";
    return { item, from: item.from, to: item.to, state };
  });
}

/** One week on the map. */
export type MapWeek = {
  week: Week;
  isNow: boolean;
  isPast: boolean;
  /** Its own note's title, if it has one. */
  title: string | null;
  landmark: string | null;
  /** Windows that open this week. */
  opening: Item[];
  /** Tasks best done this week: still to do, and done. */
  toDo: number;
  done: number;
  /** Behind today, still to do: slipped. */
  slipped: boolean;
  /** Questions asked at an appointment this week. */
  asked: number;
};

export type MapInput = {
  notes: readonly WeekNote[];
  windows: readonly MapWindow[];
  tasks: readonly Task[];
  ticks: Record<string, string>;
  questions: readonly Question[];
  now: Week | null;
  dueDate: ISODate | null;
};

export function mapWeeks({ notes, windows, tasks, ticks, questions, now, dueDate }: MapInput): MapWeek[] {
  const asked = askedWeeks(questions, dueDate);
  return allWeeks().map((week) => {
    const due = tasks.filter((t) => t.due === week);
    const toDo = due.filter((t) => !ticks[t.id]).length;
    const isPast = now !== null && week < now;
    return {
      week,
      isNow: week === now,
      isPast,
      title: notes.find((n) => n.week === week)?.title ?? null,
      landmark: LANDMARKS[week] ?? null,
      opening: windows.filter((w) => w.from === week).map((w) => w.item),
      toDo,
      done: due.length - toDo,
      slipped: isPast && toDo > 0,
      asked: [...asked.values()].filter((w) => w === week).length,
    };
  });
}

/** The week each asked question was asked in, by question id. Empty without a due date. */
export function askedWeeks(questions: readonly Question[], dueDate: ISODate | null): Map<string, Week> {
  const at = new Map<string, Week>();
  if (!dueDate) return at;
  for (const q of questions) {
    if (q.askedAt) at.set(q.id, positionOn(todayISO(new Date(q.askedAt)), dueDate).week);
  }
  return at;
}
