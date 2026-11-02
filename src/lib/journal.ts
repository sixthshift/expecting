// The Journal: what happens, kept. Each entry is on a day, kept by one of
// you (a letter can be from both), shared and editable by both. Its week is worked out from the due date
// as it's read, so a due date moved by the dating scan moves the entry's week
// and never its day.

import { addDays, daysBetween, type ISODate } from "./dates";
import { TERM_DAYS, WEEKS, type Week } from "./timeline";

export type JournalEntry = {
  id: string;
  /** A note, a movement, or a letter to the baby (a note, written to them). */
  kind: "note" | "movement" | "letter";
  day: string;
  /** HH:MM, if given. */
  time: string | null;
  /** A note's words; a movement's, if any (empty without). */
  body: string;
  /** A movement felt as slower, weaker or stopped. Always false for a note. */
  different: boolean;
  /** A letter from both of you: it's signed by both, whoever kept it. Always false for a note or a movement. */
  fromBoth: boolean;
  by: string | null;
  createdAt: string;
  editedBy: string | null;
  editedAt: string | null;
};

/** A time as kept: HH:MM, from "09:30" or the time picker's "09:30:00". */
export const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function toTime(value: string | undefined | null): string | null {
  const hm = value?.slice(0, 5);
  return hm && TIME.test(hm) ? hm : null;
}

/** The local time of `now`, HH:MM. */
export function timeNow(now: Date = new Date()): string {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/** "2:15 pm". */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number) as [number, number];
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

/** Newest first: by day, then time (an entry with none goes before the timed ones that day), then when it was written. */
export function newestFirst(entries: readonly JournalEntry[]): JournalEntry[] {
  return [...entries].sort((a, b) => b.day.localeCompare(a.day) || (b.time ?? "").localeCompare(a.time ?? "") || b.createdAt.localeCompare(a.createdAt));
}

/**
 * Where a day falls in the pregnancy: its week, or before it began, or after
 * week 42. Unlike today's position, an entry's isn't held to 1–42: a note
 * from before the pregnancy isn't week 1's.
 */
export type Place = Week | "before" | "after";

export function placeOf(day: ISODate, dueDate: ISODate): Place {
  const days = TERM_DAYS - daysBetween(day, dueDate);
  if (days < 0) return "before";
  // The first days, before a week is complete, are week 1, as they are for today.
  const week = Math.max(WEEKS.first, Math.floor(days / 7));
  return week > WEEKS.last ? "after" : week;
}

/** The entries in `week`. */
export function entriesIn(entries: readonly JournalEntry[], week: Week, dueDate: ISODate | null): JournalEntry[] {
  return dueDate ? newestFirst(entries).filter((e) => placeOf(e.day as ISODate, dueDate) === week) : [];
}

/**
 * The week movements are first offered: where `baby-movements` starts, as
 * first movements come between 16 and 24 weeks. Logging one is harmless, so
 * once any is kept, or with no due date to tell, they are offered anyway.
 */
export const MOVEMENTS_FROM: Week = 16;

/** Whether movements are offered: never while something has happened. */
export function movementsOffered({ now, quiet, entries }: { now: Week | null; quiet: boolean; entries: readonly JournalEntry[] }): boolean {
  if (quiet) return false;
  return now === null || now >= MOVEMENTS_FROM || entries.some((e) => e.kind === "movement");
}

/** Movements kept within this many minutes of each other are one: both of you tapping for the same kick is one movement. */
export const SAME_MOVEMENT_MINUTES = 5;

function minutes(time: string): number {
  const [h, m] = time.split(":").map(Number) as [number, number];
  return h * 60 + m;
}

/**
 * A day's movements as the baby's rhythm, earliest first: those kept within
 * a few minutes of the first of them are one (its time and id, felt as
 * different if any of them was), whoever kept them. Never a count.
 */
export function asOne<M extends { id: string; time: string; different: boolean }>(moved: readonly M[]): M[] {
  const out: M[] = [];
  for (const m of [...moved].sort((a, b) => a.time.localeCompare(b.time))) {
    const last = out.at(-1);
    if (last && minutes(m.time) - minutes(last.time) <= SAME_MOVEMENT_MINUTES) {
      if (m.different && !last.different) out[out.length - 1] = { ...last, different: true };
    } else out.push(m);
  }
  return out;
}

/** How many days the movements' pattern looks back, today among them. */
export const PATTERN_DAYS = 14;

/** A day of movements: each at its time of day, and whether it felt different. */
export type PatternDay = { day: ISODate; moved: { id: string; time: string; different: boolean }[] };

/**
 * The movements of the last fortnight, newest day first, each at its time
 * of day, so the baby's own rhythm shows; two kept within a few minutes are
 * one (`asOne`). Only days with one kept: a day without is a day nobody
 * wrote one down, not a day without movement. No totals, and no line for
 * what's usual.
 */
export function movementPattern(entries: readonly JournalEntry[], today: ISODate, days: number = PATTERN_DAYS): PatternDay[] {
  const from = addDays(today, 1 - days);
  const byDay = new Map<ISODate, PatternDay>();
  for (const e of entries) {
    if (e.kind !== "movement" || e.time === null || e.day < from || e.day > today) continue;
    const day = e.day as ISODate;
    const row = byDay.get(day) ?? { day, moved: [] };
    row.moved.push({ id: e.id, time: e.time, different: e.different });
    byDay.set(day, row);
  }
  return [...byDay.values()].sort((a, b) => b.day.localeCompare(a.day)).map((row) => ({ ...row, moved: asOne(row.moved) }));
}

/** How far through the day a time is, 0 to 1: where its dot sits. */
export function dayFraction(time: string): number {
  return minutes(time) / (24 * 60);
}
