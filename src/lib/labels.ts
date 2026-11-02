// How days, weeks and places in the pregnancy are said, in one place. Every
// "Thu 29", "Tue 27 Oct", "Week 28", "27 Oct – 2 Nov" on the Journal comes
// from here, so they agree. Headings and labels are capitalised; the
// `…InSentence` forms are for the middle of a sentence ("last kept today").

import { daysBetween, formatDate, type ISODate, todayISO } from "./dates";
import { formatTime, type Place, placeOf } from "./journal";
import { type Week, weekDates, weekLabel } from "./timeline";

/** "Today", or "Thu 29": a day in the story's margin, its month being the week's. */
export function marginDay(day: ISODate, today: ISODate): string {
  return day === today ? "Today" : formatDate(day, { weekday: "short", day: "numeric" });
}

/** "Tue 27 Oct"; with `today`, "Today" for today. */
export function weekdayDate(day: ISODate, today?: ISODate): string {
  return day === today ? "Today" : formatDate(day, { weekday: "short", day: "numeric", month: "short" });
}

/** "8 Sep", or "8 Sep 2025" in another year than `today`'s. */
export function shortDate(day: ISODate, today: ISODate): string {
  return day.slice(0, 4) === today.slice(0, 4) ? dayMonth(day) : fullDate(day);
}

/** "8 Sep", whatever the year. */
export function dayMonth(day: ISODate): string {
  return formatDate(day, { day: "numeric", month: "short" });
}

/** "8 Sep 2026": a date to set or answer, its year always said. */
export function fullDate(day: ISODate): string {
  return formatDate(day, { day: "numeric", month: "short", year: "numeric" });
}

/** "8 Sep", the day a moment (an ISO time) fell on, in this phone's time zone. */
export function dayOfMoment(at: string): string {
  return dayMonth(todayISO(new Date(at)));
}

/**
 * "Jason answered, 3 Oct": who did something, and the day (`at`, an ISO time).
 * With nobody to name, "Turned it on, 3 Oct", or with `comma: false` "Answered 3 Oct".
 */
export function didOn(who: string | null | undefined, did: string, at: string, { comma = true }: { comma?: boolean } = {}): string {
  const day = dayOfMoment(at);
  return who ? `${who} ${did}, ${day}` : `${did.charAt(0).toUpperCase()}${did.slice(1)}${comma ? "," : ""} ${day}`;
}

/** "84 days to go", "due today", or "3 days past the due date" (with `short`, "3 days past"). */
export function toGo(today: ISODate, dueDate: ISODate, { short = false }: { short?: boolean } = {}): string {
  const days = daysBetween(today, dueDate);
  if (days > 0) return `${days} days to go`;
  if (days === 0) return "due today";
  return short ? `${-days} days past` : `${-days} days past the due date`;
}

/**
 * "Today, 2:15 pm", "Tue 27 Oct, 2:15 pm", or "Tue 27 Oct 2025" in another year; without a time, the day.
 * `sayToday: false` gives today's date rather than "Today"; `weekdayComma: false` writes "Fri 6 Nov", not en-AU's "Fri, 6 Nov".
 */
export function when(
  day: string,
  time: string | null,
  today: ISODate = todayISO(),
  { sayToday = true, weekdayComma = true }: { sayToday?: boolean; weekdayComma?: boolean } = {}
): string {
  const full = formatDate(day as ISODate, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(day.slice(0, 4) === today.slice(0, 4) ? {} : { year: "numeric" }),
  });
  const date = sayToday && day === today ? "Today" : weekdayComma ? full : full.replace(",", "");
  return time ? `${date}, ${formatTime(time)}` : date;
}

/** "Tue 8 Sep, week 6": a day, and its week when there's a due date. */
export function dayAndWeek(day: ISODate, dueDate: ISODate | null): string {
  const date = weekdayDate(day);
  const place = dueDate ? placeOf(day, dueDate) : null;
  return typeof place === "number" ? `${date}, ${weekInSentence(place)}` : date;
}

/** "27 Oct – 2 Nov": a week's days, or null without a due date. */
export function weekRange(week: Week, dueDate: ISODate | null): string | null {
  const dates = weekDates(week, dueDate);
  return dates ? `${dayMonth(dates.start)} – ${dayMonth(dates.end)}` : null;
}

/** "week 28", for the middle of a sentence. */
export function weekInSentence(week: Week): string {
  return weekLabel(week).toLowerCase();
}

/** How far off a week is, `left` weeks from now: "this week" (or once it's gone), "in 1 week", "in 3 weeks". */
export function inWeeks(left: number): string {
  return left <= 0 ? "this week" : `in ${left} ${left === 1 ? "week" : "weeks"}`;
}

/** A heading for where things fall: "Week 28", "Before the pregnancy", "After week 42", or with no due date the month, "October 2026". */
export function placeHeading(place: Place | null, month: string | null): string {
  if (place === "before") return "Before the pregnancy";
  if (place === "after") return "After week 42";
  if (place !== null) return weekLabel(place);
  return formatDate(`${month}-01` as ISODate, { month: "long", year: "numeric" });
}

/** "today", "yesterday", or "Sat 31 Oct", for the middle of a sentence. */
export function dayInSentence(day: ISODate, today: ISODate): string {
  const ago = daysBetween(day, today);
  if (ago === 0) return "today";
  if (ago === 1) return "yesterday";
  return weekdayDate(day);
}

/** "week 12", "before the pregnancy", "after week 42", or with no due date "8 Sep", for the middle of a sentence. */
export function placeInSentence(day: ISODate, dueDate: ISODate | null): string {
  if (!dueDate) return dayMonth(day);
  const place = placeOf(day, dueDate);
  if (place === "before") return "before the pregnancy";
  if (place === "after") return "after week 42";
  return weekInSentence(place);
}
