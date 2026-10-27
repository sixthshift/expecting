import { expect, test } from "vitest";
import { addDays, type ISODate } from "../../src/lib/dates";
import { stageOf } from "../../src/lib/stage";

const today = "2026-10-27" as ISODate;

test("getting ready, with no due date, is preconception", () => {
  expect(stageOf({ dueDate: null, birthDate: null, profile: { stage: "trying" } }, today)).toBe("preconception");
});

test("expecting without a due date yet is still the pregnancy", () => {
  expect(stageOf({ dueDate: null, birthDate: null, profile: {} }, today)).toBe("pregnancy");
  expect(stageOf({ dueDate: null, birthDate: null, profile: { stage: "pregnant" } }, today)).toBe("pregnancy");
});

test("a due date is the pregnancy, whatever the stage answer says", () => {
  expect(stageOf({ dueDate: addDays(today, 84), birthDate: null, profile: { stage: "trying" } }, today)).toBe("pregnancy");
});

test("a birth date is postpartum, from the day of the birth", () => {
  const dueDate = addDays(today, 10);
  expect(stageOf({ dueDate, birthDate: today, profile: {} }, today)).toBe("postpartum");
  expect(stageOf({ dueDate, birthDate: addDays(today, 1), profile: {} }, today)).toBe("pregnancy");
});

test("once 42 weeks are done with no birth date, the due date stands in for the birth", () => {
  expect(stageOf({ dueDate: addDays(today, -21), birthDate: null, profile: {} }, today)).toBe("postpartum");
  expect(stageOf({ dueDate: addDays(today, -20), birthDate: null, profile: {} }, today)).toBe("pregnancy");
});
