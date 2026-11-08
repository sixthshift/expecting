// An appointment as a calendar file (RFC 5545), for the phone's own calendar,
// which does what Expecting doesn't: reminders, and fitting it among the rest
// of the week. Its day and time are kept local with no zone, so the event is
// "floating": 10:30 is 10:30 wherever the phone is. Without a time it's an
// all-day event; with one it's given an hour, as nothing says how long.

import { addDays, type ISODate } from "../dates";
import type { Appointment } from "./appointments";

/** The calendar's id for an appointment: the same each time, so a calendar can tell it's one it has. */
const uidOf = (id: string) => `${id}@expecting`;

/** Words as a calendar file writes them: backslash, semicolon, comma and line breaks escaped. */
function text(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, ";").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** A line folded at 75 octets, as the format asks, never splitting a character. */
function fold(line: string): string {
  const bytes = new TextEncoder();
  const out: string[] = [];
  let current = "";
  for (const ch of line) {
    // Continuation lines start with a space, which counts.
    const limit = out.length === 0 ? 75 : 74;
    if (bytes.encode(current + ch).length > limit) {
      out.push(current);
      current = ch;
    } else current += ch;
  }
  out.push(current);
  return out.join("\r\n ");
}

const compactDate = (day: string) => day.replaceAll("-", "");

/** A local time an hour on: "10:30" on a day to that day's 11:30, or past midnight to the next day's. */
function anHourOn(day: string, time: string): { day: string; time: string } {
  const [h, m] = time.split(":").map(Number) as [number, number];
  return h === 23
    ? { day: addDays(day as ISODate, 1), time: `00:${String(m).padStart(2, "0")}` }
    : { day, time: `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}` };
}

/** "20261106T103000": a floating local time. */
const local = (day: string, time: string) => `${compactDate(day)}T${time.replace(":", "")}00`;

/** "20261102T040000Z". */
const utc = (iso: string) => `${iso.replace(/[-:]/g, "").slice(0, 15)}Z`;

/** The appointment as a calendar file, CRLF line endings. `now` stamps it. */
export function icsOf(appointment: Appointment, now: Date = new Date()): string {
  const { day, time } = appointment;
  const when = time
    ? (() => {
        const end = anHourOn(day, time);
        return [`DTSTART:${local(day, time)}`, `DTEND:${local(end.day, end.time)}`];
      })()
    : [`DTSTART;VALUE=DATE:${compactDate(day)}`, `DTEND;VALUE=DATE:${compactDate(addDays(day as ISODate, 1))}`];
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Expecting//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uidOf(appointment.id)}`,
    `DTSTAMP:${utc(now.toISOString())}`,
    `LAST-MODIFIED:${utc(appointment.editedAt ?? appointment.createdAt)}`,
    ...when,
    `SUMMARY:${text(appointment.title)}`,
    ...(appointment.place ? [`LOCATION:${text(appointment.place)}`] : []),
    ...(appointment.notes ? [`DESCRIPTION:${text(appointment.notes)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

/** A file name from its title: "20-week scan" → "20-week-scan.ics". */
export function icsName(appointment: Pick<Appointment, "title">): string {
  const slug = appointment.title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `${slug || "appointment"}.ics`;
}

/** Where an appointment's calendar file is: src/api/rest/calendar.ts. */
export const icsPath = (id: string) => `/api/appointments/${id}/calendar.ics`;
