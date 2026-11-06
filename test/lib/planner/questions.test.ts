import { expect, test } from "vitest";
import type { ISODate } from "../../../src/lib/dates";
import type { Appointment } from "../../../src/lib/planner/appointments";
import { type Question, questionsByAppointment, waitingAt } from "../../../src/lib/planner/questions";

const today = "2026-11-06" as ISODate;

function appointment(id: string, day: string): Appointment {
  return { id, title: id, day, time: null, place: null, notes: null, by: null, createdAt: "x", editedBy: null, editedAt: null };
}

function question(id: string, appointmentId: string | null, askedAt: string | null = null): Question {
  return { id, text: id, answer: null, askedAt, itemId: null, by: null, createdAt: "x", appointmentId };
}

const appointments = [
  appointment("been", "2026-10-30"),
  appointment("today", "2026-11-06"),
  appointment("scan", "2026-11-20"),
  appointment("gp", "2026-12-01"),
];

test("the questions by the appointment they're for", () => {
  const questions = [
    question("for-scan", "scan"),
    question("missed", "been"),
    question("asked-been", "been", "2026-10-30T01:00:00Z"),
    question("asked-today", "today", "2026-11-06T01:00:00Z"),
    question("deleted", "gone"),
    question("asked-gone", null, "2026-09-01T01:00:00Z"),
  ];
  const by = questionsByAppointment(questions, appointments, today);
  // The next always, even with nothing to ask; the rest still ahead only with something.
  expect(by.ahead.map((g) => [g.appointment.id, g.questions.map((q) => q.id)])).toEqual([
    ["today", []],
    ["scan", ["for-scan"]],
  ]);
  expect(by.missed.map((g) => [g.appointment.id, g.questions.map((q) => q.id)])).toEqual([["been", ["missed"]]]);
  expect(by.forNone.map((q) => q.id)).toEqual(["deleted"]);
  // What was asked, latest appointment first.
  expect(by.asked.map((g) => [g.appointment.id, g.questions.map((q) => q.id)])).toEqual([
    ["today", ["asked-today"]],
    ["been", ["asked-been"]],
  ]);
  expect(by.askedAtNone.map((q) => q.id)).toEqual(["asked-gone"]);
});

test("a question waiting at an appointment, in the same words", () => {
  const questions = [{ ...question("q", "scan"), text: "Is my iron OK?" }];
  expect(waitingAt(questions, "scan", "is my iron ok")).toBe(true);
  expect(waitingAt(questions, "gp", "Is my iron OK?")).toBe(false);
});
