import { expect, test } from "vitest";
import { addDays, daysBetween, formatDate, isISODate, todayISO } from "../../src/lib/dates";

test("isISODate accepts real dates only", () => {
  expect(isISODate("2026-10-27")).toBe(true);
  expect(isISODate("2026-02-30")).toBe(false);
  expect(isISODate("27/10/2026")).toBe(false);
});

test("day arithmetic ignores daylight saving", () => {
  // Sydney's clocks go forward on 4 Oct 2026.
  expect(daysBetween("2026-10-01", "2026-10-08")).toBe(7);
  expect(addDays("2026-10-01", 7)).toBe("2026-10-08");
  expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
});

test("today is the local calendar date", () => {
  expect(todayISO(new Date(2026, 9, 27, 23, 59))).toBe("2026-10-27");
});

test("dates read the Australian way", () => {
  expect(formatDate("2026-10-27")).toBe("Tue, 27 Oct 2026");
});
