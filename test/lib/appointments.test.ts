import { expect, test } from "vitest";
import { type Appointment, appointmentSoon, appointmentsIn, appointmentWhen, nextAppointment, splitAppointments } from "../../src/lib/appointments";

function appt(title: string, day: string, time: string | null = null): Appointment {
  return { id: title, title, day, time, place: null, notes: null, by: null, createdAt: "2026-10-01T00:00:00Z", editedBy: null, editedAt: null };
}

const today = "2026-11-02";

test("the next is the earliest still ahead, today's included until the day is over", () => {
  const all = [appt("Scan", "2026-11-20"), appt("Midwife", "2026-11-02", "16:00"), appt("GP", "2026-10-30")];
  expect(nextAppointment(all, today)?.title).toBe("Midwife");
  expect(nextAppointment([appt("GP", "2026-10-30")], today)).toBeNull();
});

test("ahead earliest first, an untimed one first on its day; gone latest first", () => {
  const all = [appt("B", "2026-11-05", "09:00"), appt("A", "2026-11-05"), appt("Old", "2026-10-01"), appt("Older", "2026-09-01")];
  const { ahead, past } = splitAppointments(all, today);
  expect(ahead.map((a) => a.title)).toEqual(["A", "B"]);
  expect(past.map((a) => a.title)).toEqual(["Old", "Older"]);
});

test("when, in en-AU words, the year only when it isn't this one", () => {
  expect(appointmentWhen({ day: "2026-11-06", time: "10:30" }, today)).toBe("Fri 6 Nov, 10:30 am");
  expect(appointmentWhen({ day: "2026-11-06", time: null }, today)).toBe("Fri 6 Nov");
  expect(appointmentWhen({ day: "2027-01-08", time: "14:00" }, today)).toBe("Fri 8 Jan 2027, 2:00 pm");
});

test("how soon, within a fortnight", () => {
  expect(appointmentSoon({ day: "2026-11-02" }, today)).toBe("Today");
  expect(appointmentSoon({ day: "2026-11-03" }, today)).toBe("Tomorrow");
  expect(appointmentSoon({ day: "2026-11-09" }, today)).toBe("In 7 days");
  expect(appointmentSoon({ day: "2026-11-17" }, today)).toBeNull();
  expect(appointmentSoon({ day: "2026-11-01" }, today)).toBeNull();
});

test("a week's appointments, by the due date; none without one", () => {
  // Due 2027-03-01: week 28 is 7 to 13 Dec 2026.
  const all = [appt("In", "2026-12-08"), appt("Out", "2026-12-14")];
  expect(appointmentsIn(all, 28, "2027-03-01").map((a) => a.title)).toEqual(["In"]);
  expect(appointmentsIn(all, 28, null)).toEqual([]);
});
