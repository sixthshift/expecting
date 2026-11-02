import { expect, test } from "vitest";
import type { Appointment } from "../../../src/lib/planner/appointments";
import { icsName, icsOf } from "../../../src/lib/planner/calendar";

const now = new Date("2026-11-02T04:00:00Z");

function appt(over: Partial<Appointment> = {}): Appointment {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Midwife",
    day: "2026-11-06",
    time: "10:30",
    place: null,
    notes: null,
    by: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    editedBy: null,
    editedAt: null,
    ...over,
  };
}

test("a timed one floats in local time, an hour long, with CRLF lines", () => {
  const ics = icsOf(appt(), now);
  expect(ics.split("\r\n")).toEqual([
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Expecting//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:11111111-1111-4111-8111-111111111111@expecting",
    "DTSTAMP:20261102T040000Z",
    "LAST-MODIFIED:20261101T000000Z",
    "DTSTART:20261106T103000",
    "DTEND:20261106T113000",
    "SUMMARY:Midwife",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]);
});

test("without a time it's all day; late at night its hour runs into the next day", () => {
  expect(icsOf(appt({ time: null }), now)).toContain("DTSTART;VALUE=DATE:20261106\r\nDTEND;VALUE=DATE:20261107\r\n");
  expect(icsOf(appt({ day: "2026-12-31", time: "23:15" }), now)).toContain("DTSTART:20261231T231500\r\nDTEND:20270101T001500\r\n");
});

test("the place and notes, escaped, and a long line folded without splitting a character", () => {
  const ics = icsOf(
    appt({
      place: "Clinic 2, Level 3; East wing",
      notes: `Bring the referral\nand the bloods\\results. ${"é".repeat(60)}`,
      editedAt: "2026-11-02T01:00:00.000Z",
    }),
    now
  );
  expect(ics).toContain("LOCATION:Clinic 2\\, Level 3; East wing\r\n");
  expect(ics).toContain("LAST-MODIFIED:20261102T010000Z");
  const description = ics.slice(ics.indexOf("DESCRIPTION:"), ics.indexOf("END:VEVENT"));
  for (const line of description.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  expect(description.replace(/\r\n /g, "")).toBe(`DESCRIPTION:Bring the referral\\nand the bloods\\\\results. ${"é".repeat(60)}\r\n`);
});

test("its file name from its title", () => {
  expect(icsName({ title: "20-week scan" })).toBe("20-week-scan.ics");
  expect(icsName({ title: "GP: bloods & urine" })).toBe("gp-bloods-urine.ics");
  expect(icsName({ title: "!!!" })).toBe("appointment.ics");
});
