import { expect, test } from "vitest";
import type { Task } from "../../../src/content/schema";
import { oneThingKey, oneThings } from "../../../src/lib/home/oneThing";
import type { ToDo } from "../../../src/lib/planner/todo";

function toDo(id: string, why: ToDo["why"]): ToDo {
  const task: Task = { id, title: id, opens: 1, due: 30, deadline: null, deadlineFrom: null, who: "together", keeps: null, itemId: "i", origin: "built-in" };
  return { task, why };
}

const keys = (input: Parameters<typeof oneThings>[0]) => oneThings(input).map(oneThingKey);

test("an appointment today first, then something late, then how you are, then the next thing, and the read always last", () => {
  expect(keys({ appointmentToday: "a1", toDo: [toDo("parking", "slipped")], checkedIn: false })).toEqual(["appointment:a1", "task:parking", "checkIn", "read"]);
});

test("a task not yet late waits behind how you are today", () => {
  expect(keys({ appointmentToday: null, toDo: [toDo("invites", "soon")], checkedIn: false })).toEqual(["checkIn", "task:invites", "read"]);
  expect(keys({ appointmentToday: null, toDo: [toDo("claim", "deadline")], checkedIn: false })).toEqual(["task:claim", "checkIn", "read"]);
});

test("only the first thing to do is one; once you've said how you are, it's not asked", () => {
  expect(keys({ appointmentToday: null, toDo: [toDo("a", "soon"), toDo("b", "soon")], checkedIn: true })).toEqual(["task:a", "read"]);
});

test("with nothing else, the day's read", () => {
  expect(keys({ appointmentToday: null, toDo: [], checkedIn: true })).toEqual(["read"]);
});
