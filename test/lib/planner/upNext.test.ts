import { expect, test } from "vitest";
import type { Task } from "../../../src/content/schema";
import type { Appointment } from "../../../src/lib/planner/appointments";
import { planTasks } from "../../../src/lib/planner/plan";
import { upNext } from "../../../src/lib/planner/upNext";

function task(id: string, due: number, extra: Partial<Task> = {}): Task {
  return { id, title: id, opens: 1, due, deadline: null, deadlineFrom: null, who: "together", keeps: null, itemId: null, origin: "own", ...extra };
}
function appt(title: string, day: string): Appointment {
  return { id: title, title, day, time: null, place: null, notes: null, by: null, createdAt: "2026-10-01T00:00:00Z", editedBy: null, editedAt: null };
}
// Due 11 Jan 2027: week 30 is 2–8 Nov, 31 is 9–15 Nov, 32 is 16–22 Nov, 33 is 23–29 Nov.
const dueDate = "2027-01-11";
const tasks = [
  task("deadline", 30, { deadline: 30 }),
  task("this-week", 30),
  task("opens-31", 33, { opens: 31 }),
  task("by-33", 33, { opens: 33 }),
  task("far", 40, { opens: 40 }),
];
const plan = planTasks(tasks, {}, new Set(), 30);
const shape = (weeks: ReturnType<typeof upNext>) =>
  weeks.map((w) => `${w.week}: ${[...w.appointments.map((a) => `📅${a.title}`), ...w.now.map((t) => t.task.id), ...w.ahead.map((a) => a.task.id)].join(" ")}`);

test("this week has its appointments and To do now, next up first; each week after has its own", () => {
  const weeks = upNext(plan, [appt("Midwife", "2026-11-04"), appt("Tour", "2026-11-18")], 30, dueDate);
  expect(shape(weeks)).toEqual(["30: 📅Midwife deadline this-week", "31: opens-31", "32: 📅Tour", "33: by-33"]);
});

test("a later week with nothing in it is left out, and nothing past four weeks is on it", () => {
  const weeks = upNext(plan, [appt("Far off", "2026-12-14")], 30, dueDate);
  expect(weeks.map((w) => w.week)).toEqual([30, 31, 33]);
});

test("this week is there even with nothing in it", () => {
  const empty = planTasks([task("far", 40, { opens: 40 })], {}, new Set(), 30);
  expect(upNext(empty, [], 30, dueDate).map((w) => w.week)).toEqual([30]);
});

test("it stops at week 42", () => {
  const late = planTasks([], {}, new Set(), 41);
  expect(upNext(late, [], 41, dueDate).map((w) => w.week)).toEqual([41]);
});
