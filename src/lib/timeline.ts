// The spine of the app: where in the pregnancy a moment sits.
//
// A week is a pregnancy week, 1 to 42, counted as completed weeks of
// gestation, the way midwives and the national guidelines count ("28 weeks" is
// 28+0 to 28+6). It is also its own URL key: `/timeline?at=28`.
//
// The current week is derived from the due date on every read. Nothing here
// stores it.

import { addDays, daysBetween, type ISODate } from "./dates";

/** A pregnancy week, 1 to 42. */
export type Week = number;

export const WEEKS = { first: 1, last: 42 } as const;

/** Days from the first day of the last period to the due date: 40+0. */
export const TERM_DAYS = 280;

/** Every week, in order. */
export function allWeeks(): Week[] {
  return Array.from({ length: WEEKS.last - WEEKS.first + 1 }, (_, i) => WEEKS.first + i);
}

/** The week a URL key names (`28`), or null when it names none. */
export function parseWeekKey(key: string): Week | null {
  if (!/^\d{1,2}$/.test(key)) return null;
  const week = Number(key);
  return week >= WEEKS.first && week <= WEEKS.last ? week : null;
}

/** "Week 28". */
export function weekLabel(week: Week): string {
  return `Week ${week}`;
}

/** A week as seen from this one: "This week", "Next week", "In 3 weeks", "Last week", "3 weeks ago". */
export function weekFromNow(week: Week, now: Week): string {
  const d = week - now;
  if (d === 0) return "This week";
  if (d === 1) return "Next week";
  if (d === -1) return "Last week";
  return d > 0 ? `In ${d} weeks` : `${-d} weeks ago`;
}

export type Position = {
  week: Week;
  /** Days since the first day of the last period; 0 before it. */
  gestationDays: number;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Where `today` sits, given the due date. Before week 1 it reads as week 1,
 * and past 42 weeks as week 42, so the app never runs off either end.
 */
export function positionOn(today: ISODate, dueDate: ISODate): Position {
  const gestationDays = Math.max(0, TERM_DAYS - daysBetween(today, dueDate));
  return { week: clamp(Math.floor(gestationDays / 7), WEEKS.first, WEEKS.last), gestationDays };
}

/** Gestation as midwives write it: "28+3". */
export function gestationLabel(gestationDays: number): string {
  return `${Math.floor(gestationDays / 7)}+${gestationDays % 7}`;
}

/**
 * The due dates worth accepting on `today`: from just past one to a pregnancy
 * that has barely begun.
 */
export function dueDateBounds(today: ISODate): { minDate: ISODate; maxDate: ISODate } {
  return { minDate: addDays(today, -7 * 3), maxDate: addDays(today, 7 * 44) };
}

/** The first day of a pregnancy week, given the due date. */
export function weekStarts(week: Week, dueDate: ISODate): ISODate {
  return addDays(dueDate, week * 7 - TERM_DAYS);
}

/** The calendar days a week covers, or null without a due date. */
export function weekDates(week: Week, dueDate: ISODate | null): { start: ISODate; end: ISODate } | null {
  if (!dueDate) return null;
  const start = weekStarts(week, dueDate);
  return { start, end: addDays(start, 6) };
}
