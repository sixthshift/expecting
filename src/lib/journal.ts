// The Journal: what happens, kept. Each entry is on a day, written by one of
// you, shared and editable by both. Its week is worked out from the due date
// as it's read, so a due date moved by the dating scan moves the entry's week
// and never its day.

import { daysBetween, type ISODate } from "./dates";
import { TERM_DAYS, WEEKS, type Week } from "./timeline";

export type JournalEntry = {
  id: string;
  kind: "note";
  day: string;
  /** HH:MM, if given. */
  time: string | null;
  body: string;
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
