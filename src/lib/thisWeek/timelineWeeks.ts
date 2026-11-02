// The timeline: the whole pregnancy at once, week by week. Pure, so what it shows
// is tested apart from the screen.
//
//   every week, 1 to 42, one line each: its note's title or a landmark, what
//   opens, what's to do, what's done, what was kept in the Journal; a week's detail is This week's (/?at=)
//   the windows: each item that asks something of you, drawn across its weeks,
//   so what overlaps and what's open now can be seen at a glance
//   landmarks: the moments people mark, halfway, full term, the due date

import { asks, type DatedItem, type Item, type Task } from "../../content/schema";
import type { WeekNote } from "../../content/weeks";
import { type ISODate, todayISO } from "../dates";
import { type AppetiteEntry, weekAppetite } from "../journal/appetite";
import { type Feeling, type Step, weekStep } from "../journal/feelings";
import { type JournalEntry, placeOf } from "../journal/journal";
import { type Paper, type WeekPapers, weekPapers } from "../journal/papers";
import { type Photo, type WeekPhotos, weekPhotos } from "../journal/photos";
import type { Appointment } from "../planner/appointments";
import type { Question } from "../planner/questions";
import { allWeeks, positionOn, type Week, weekDates } from "../timeline";

/** The weeks people mark. The trimesters are the timeline's chapters, not landmarks. */
export const LANDMARKS: Readonly<Record<Week, string>> = { 20: "Halfway", 37: "Full term", 40: "Due date" };

/** Where a window stands today: behind, open now, ahead, or done (every task ticked). */
export type WindowState = "past" | "open" | "ahead" | "done";

/** An item that asks something of you, across its weeks. */
export type TimelineWindow = { item: DatedItem; from: Week; to: Week; state: WindowState };

export function timelineWindows(items: readonly Item[], ticks: Record<string, string>, now: Week | null): TimelineWindow[] {
  const asking = items.filter(asks).sort((a, b) => a.from - b.from || a.to - b.to);
  return asking.map((item) => {
    const done = item.tasks.every((t) => ticks[t.id]);
    const state: WindowState = done ? "done" : now === null || now < item.from ? "ahead" : now > item.to ? "past" : "open";
    return { item, from: item.from, to: item.to, state };
  });
}

/** One week on the timeline. */
export type TimelineWeek = {
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
  /** Appointments on its days. */
  appointments: number;
  /** Questions asked at an appointment this week. */
  asked: number;
  /** Notes kept in the Journal on its days. */
  kept: number;
  /** Whether a movement was kept on its days: a mark, never a count. */
  moved: boolean;
  /** How each of you felt that week, one step each (weekStep), for whoever checked in. */
  felt: Step[];
  /** The days that week with any sickness kept. */
  sick: number;
  /** That week's most kept craving, if any. */
  craved: string | null;
  /** What it kept in pictures: a bump photo, how many scans, how many others. */
  photos: WeekPhotos;
  /** The results and papers dated in it, by kind. */
  papers: WeekPapers;
};

export type TimelineInput = {
  notes: readonly WeekNote[];
  windows: readonly TimelineWindow[];
  tasks: readonly Task[];
  ticks: Record<string, string>;
  questions: readonly Question[];
  journal: readonly JournalEntry[];
  feelings: readonly Feeling[];
  appetite: readonly AppetiteEntry[];
  /** Photos and scans; none if not given. */
  photos?: readonly Photo[];
  /** Results and papers; none if not given. */
  papers?: readonly Paper[];
  /** Appointments; none if not given. */
  appointments?: readonly Appointment[];
  now: Week | null;
  dueDate: ISODate | null;
};

export function timelineWeeks({
  notes,
  windows,
  tasks,
  ticks,
  questions,
  journal,
  feelings,
  appetite,
  photos = [],
  papers = [],
  appointments = [],
  now,
  dueDate,
}: TimelineInput): TimelineWeek[] {
  const asked = askedWeeks(questions, dueDate);
  const feelers = [...new Set(feelings.map((f) => f.by))].sort();
  const booked = dueDate ? appointments.map((a) => placeOf(a.day as ISODate, dueDate)) : [];
  const placed = dueDate ? journal.map((e) => ({ kind: e.kind, place: placeOf(e.day as ISODate, dueDate) })) : [];
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
      appointments: booked.filter((place) => place === week).length,
      asked: [...asked.values()].filter((w) => w === week).length,
      kept: placed.filter((e) => e.kind === "note" && e.place === week).length,
      moved: placed.some((e) => e.kind === "movement" && e.place === week),
      felt: felt(feelings, feelers, week, dueDate),
      ...weekAppetite(appetite, week, dueDate),
      photos: weekPhotos(photos, week, dueDate),
      papers: weekPapers(papers, week, dueDate),
    };
  });
}

/** Each person's step for a week, for those who checked in that week. None without a due date. */
function felt(feelings: readonly Feeling[], feelers: readonly string[], week: Week, dueDate: ISODate | null): Step[] {
  const dates = weekDates(week, dueDate);
  if (!dates) return [];
  return feelers.flatMap((by) => weekStep(feelings, by, dates.start, dates.end) ?? []);
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
