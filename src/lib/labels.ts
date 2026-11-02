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
  return formatDate(day, { day: "numeric", month: "short", ...(day.slice(0, 4) === today.slice(0, 4) ? {} : { year: "numeric" }) });
}

/** "Today, 2:15 pm", "Tue 27 Oct, 2:15 pm", or "Tue 27 Oct 2025" in another year; without a time, the day. */
export function when(day: string, time: string | null, today: ISODate = todayISO()): string {
  const date =
    day === today
      ? "Today"
      : formatDate(day as ISODate, { weekday: "short", day: "numeric", month: "short", ...(day.slice(0, 4) === today.slice(0, 4) ? {} : { year: "numeric" }) });
  return time ? `${date}, ${formatTime(time)}` : date;
}

/** "Tue 8 Sep, week 6": a day, and its week when there's a due date. */
export function dayAndWeek(day: ISODate, dueDate: ISODate | null): string {
  const date = weekdayDate(day);
  const place = dueDate ? placeOf(day, dueDate) : null;
  return typeof place === "number" ? `${date}, ${weekLabel(place).toLowerCase()}` : date;
}

/** "27 Oct – 2 Nov": a week's days, or null without a due date. */
export function weekRange(week: Week, dueDate: ISODate | null): string | null {
  const dates = weekDates(week, dueDate);
  return dates ? `${formatDate(dates.start, { day: "numeric", month: "short" })} – ${formatDate(dates.end, { day: "numeric", month: "short" })}` : null;
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
  if (!dueDate) return formatDate(day, { day: "numeric", month: "short" });
  const place = placeOf(day, dueDate);
  if (place === "before") return "before the pregnancy";
  if (place === "after") return "after week 42";
  return weekLabel(place).toLowerCase();
}
