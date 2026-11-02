import { expect, test } from "vitest";
import { dayAndWeek, dayInSentence, marginDay, placeHeading, placeInSentence, shortDate, weekdayDate, weekRange, when } from "../../src/lib/labels";

// Due 19 Jan 2027: week 28 runs Tue 27 Oct to Mon 2 Nov 2026.
const DUE = "2027-01-19";
const today = "2026-10-29";

test("a day: in the margin, with its month, short, and when", () => {
  expect(marginDay(today, today)).toBe("Today");
  expect(marginDay("2026-10-27", today)).toBe("Tue 27");
  expect(weekdayDate("2026-10-27")).toBe("Tue, 27 Oct");
  expect(weekdayDate(today, today)).toBe("Today");
  expect(shortDate("2026-09-08", today)).toBe("8 Sept");
  expect(shortDate("2025-09-08", today)).toBe("8 Sept 2025");
  expect(when(today, "14:15", today)).toBe("Today, 2:15 pm");
  expect(when("2026-10-27", null, today)).toBe("Tue, 27 Oct");
});

test("a week and a place: its days, its heading, and in a sentence", () => {
  expect(weekRange(28, DUE)).toBe("27 Oct – 2 Nov");
  expect(weekRange(28, null)).toBeNull();
  expect(placeHeading(28, null)).toBe("Week 28");
  expect(placeHeading("before", null)).toBe("Before the pregnancy");
  expect(placeHeading(null, "2026-10")).toBe("October 2026");
  expect(dayAndWeek("2026-10-27", DUE)).toBe("Tue, 27 Oct, week 28");
  expect(placeInSentence("2026-10-27", DUE)).toBe("week 28");
  expect(dayInSentence("2026-10-28", today)).toBe("yesterday");
  expect(dayInSentence("2026-10-27", today)).toBe("Tue, 27 Oct");
});
