// The Journal: what happens, kept. Each entry is on a day, written by one of
// you, shared and editable by both. Its week is worked out from the due date
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

/** A run of entries under one heading: a week, before or after the pregnancy, or (with no due date) a month. */
export type EntryGroup = { key: string; place: Place | null; month: string | null; entries: JournalEntry[] };

/** Entries newest first, grouped by where they fall: by week, or by month while there's no due date. */
export function groupEntries(entries: readonly JournalEntry[], dueDate: ISODate | null): EntryGroup[] {
  const groups: EntryGroup[] = [];
  for (const entry of newestFirst(entries)) {
    const place = dueDate ? placeOf(entry.day as ISODate, dueDate) : null;
    const month = dueDate ? null : entry.day.slice(0, 7);
    const key = String(place ?? month);
    const last = groups.at(-1);
    if (last?.key === key) last.entries.push(entry);
    else groups.push({ key, place, month, entries: [entry] });
  }
  return groups;
}

/** The entries in `week`. */
export function entriesIn(entries: readonly JournalEntry[], week: Week, dueDate: ISODate | null): JournalEntry[] {
  return dueDate ? newestFirst(entries).filter((e) => placeOf(e.day as ISODate, dueDate) === week) : [];
}

/** Whether an entry has every word of `query` in it, in any case. An empty query matches all. */
export function matches(entry: JournalEntry, query: string): boolean {
  const body = entry.body.toLocaleLowerCase("en-AU");
  return query
    .toLocaleLowerCase("en-AU")
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => body.includes(word));
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

/** How many days the movements' pattern looks back, today among them. */
export const PATTERN_DAYS = 14;

/** A day of movements: each at its time of day, and whether it felt different. */
export type PatternDay = { day: ISODate; moved: { id: string; time: string; different: boolean }[] };

/**
 * The movements of the last fortnight, newest day first, each at its time
 * of day, so the baby's own rhythm shows. Only days with one kept: a day
 * without is a day nobody wrote one down, not a day without movement. No
 * totals, and no line for what's usual.
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
  return [...byDay.values()]
    .sort((a, b) => b.day.localeCompare(a.day))
    .map((row) => ({ ...row, moved: row.moved.sort((a, b) => a.time.localeCompare(b.time)) }));
}

/** How far through the day a time is, 0 to 1: where its dot sits. */
export function dayFraction(time: string): number {
  const [h, m] = time.split(":").map(Number) as [number, number];
  return (h * 60 + m) / (24 * 60);
}
