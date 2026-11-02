// Appointments: what, the day, perhaps the time and the place, and notes.
// One-off, shared, editable by both. "The next appointment" is the earliest
// still ahead: today's counts until the day is over, so its questions are
// there in the waiting room. Its week is worked out from the due date on read,
// like a Journal entry's, so a moved due date moves its week and never its day.

import { daysBetween, type ISODate } from "../dates";
import { placeOf } from "../journal/journal";
import type { Week } from "../timeline";

export type Appointment = {
  id: string;
  /** What it is: "Midwife", "20-week scan". */
  title: string;
  /** YYYY-MM-DD, local. */
  day: string;
  /** HH:MM, local, if known. */
  time: string | null;
  place: string | null;
  notes: string | null;
  by: string | null;
  createdAt: string;
  editedBy: string | null;
  editedAt: string | null;
};

/** Earliest first: by day, then time, a day's untimed one first. */
function byWhen(a: Appointment, b: Appointment): number {
  return a.day.localeCompare(b.day) || (a.time ?? "").localeCompare(b.time ?? "") || a.createdAt.localeCompare(b.createdAt);
}

/** Those still ahead, today's included, earliest first; and those gone, latest first. */
export function splitAppointments(appointments: readonly Appointment[], today: ISODate): { ahead: Appointment[]; past: Appointment[] } {
  const sorted = [...appointments].sort(byWhen);
  return { ahead: sorted.filter((a) => a.day >= today), past: sorted.filter((a) => a.day < today).reverse() };
}

/** The next appointment: the earliest still ahead, today's included; null when none is. */
export function nextAppointment(appointments: readonly Appointment[], today: ISODate): Appointment | null {
  return splitAppointments(appointments, today).ahead[0] ?? null;
}

/** How an appointment's when is said, through labels' `when`: "Thu 6 Nov, 10:30 am", its date even today, without en-AU's comma. */
export const APPOINTMENT_WHEN = { sayToday: false, weekdayComma: false } as const;

/** How soon, in words: "Today", "Tomorrow", "In 5 days"; null once it's gone or more than a fortnight off. */
export function appointmentSoon(appointment: Pick<Appointment, "day">, today: ISODate): string | null {
  const d = daysBetween(today, appointment.day as ISODate);
  if (d < 0 || d > 14) return null;
  return d === 0 ? "Today" : d === 1 ? "Tomorrow" : `In ${d} days`;
}

/** The appointments in `week`, earliest first; none without a due date. */
export function appointmentsIn(appointments: readonly Appointment[], week: Week, dueDate: ISODate | null): Appointment[] {
  return dueDate ? [...appointments].sort(byWhen).filter((a) => placeOf(a.day as ISODate, dueDate) === week) : [];
}
