import { formatDate, type ISODate, todayISO } from "../../../lib/dates";
import { formatTime } from "../../../lib/journal";

/** "Tue 14 Jul". */
export function dayOf(day: string): string {
  return formatDate(day as ISODate, { weekday: "short", day: "numeric", month: "short" });
}

/** "Today, 2:15 pm", "Tue 27 Oct, 2:15 pm". */
export function when(day: string, time: string | null, today: ISODate = todayISO()): string {
  const date =
    day === today
      ? "Today"
      : formatDate(day as ISODate, { weekday: "short", day: "numeric", month: "short", ...(day.slice(0, 4) === today.slice(0, 4) ? {} : { year: "numeric" }) });
  return time ? `${date}, ${formatTime(time)}` : date;
}
