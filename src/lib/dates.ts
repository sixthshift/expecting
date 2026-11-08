// Calendar dates as ISO strings ("2026-10-27"), with the arithmetic the
// timeline needs, and times of day as kept ("09:30"). Days are counted in UTC
// so daylight saving never makes a day 23 or 25 hours long; "today" is the
// local date.

export type ISODate = `${number}-${number}-${number}`;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export function isISODate(value: string): value is ISODate {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toUTC(date: ISODate): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function fromUTC(ms: number): ISODate {
  return new Date(ms).toISOString().slice(0, 10) as ISODate;
}

/** Whole days from `from` to `to`: positive when `to` is later. */
export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((toUTC(to) - toUTC(from)) / DAY_MS);
}

export function addDays(date: ISODate, days: number): ISODate {
  return fromUTC(toUTC(date) + days * DAY_MS);
}

/** The local calendar date of `now`. */
export function todayISO(now: Date = new Date()): ISODate {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}` as ISODate;
}

/** The local calendar date a moment (an ISO time) falls on, on this phone. */
export function dayOf(at: string): ISODate {
  return todayISO(new Date(at));
}

/** "Tue, 27 Oct 2026", en-AU. */
export function formatDate(date: ISODate, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" }): string {
  return new Intl.DateTimeFormat("en-AU", { ...opts, timeZone: "UTC" }).format(new Date(toUTC(date)));
}

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
