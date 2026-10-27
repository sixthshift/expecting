import { expect, test } from "vitest";
import { addDays, type ISODate } from "../../src/lib/dates";
import { currentPhase } from "../../src/lib/phase";

const today = "2026-10-27" as ISODate;

test("getting ready, with no due date, is preconception", () => {
  expect(currentPhase({ dueDate: null, birthDate: null, profile: { expecting: "not-yet" } }, today)).toBe("preconception");
});

test("expecting without a due date yet is still the pregnancy", () => {
  expect(currentPhase({ dueDate: null, birthDate: null, profile: {} }, today)).toBe("pregnancy");
  expect(currentPhase({ dueDate: null, birthDate: null, profile: { expecting: "yes" } }, today)).toBe("pregnancy");
});

test("a due date is the pregnancy, whatever the expecting answer says", () => {
  expect(currentPhase({ dueDate: addDays(today, 84), birthDate: null, profile: { expecting: "not-yet" } }, today)).toBe("pregnancy");
});

test("a birth date is postpartum, from the day of the birth", () => {
  const dueDate = addDays(today, 10);
  expect(currentPhase({ dueDate, birthDate: today, profile: {} }, today)).toBe("postpartum");
  expect(currentPhase({ dueDate, birthDate: addDays(today, 1), profile: {} }, today)).toBe("pregnancy");
});

test("once 42 weeks are done with no birth date, the due date stands in for the birth", () => {
  expect(currentPhase({ dueDate: addDays(today, -21), birthDate: null, profile: {} }, today)).toBe("postpartum");
  expect(currentPhase({ dueDate: addDays(today, -20), birthDate: null, profile: {} }, today)).toBe("pregnancy");
});
