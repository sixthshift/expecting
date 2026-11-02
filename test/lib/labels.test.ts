import { expect, test } from "vitest";
import {
  dayAndWeek,
  dayInSentence,
  dayMonth,
  dayOfMoment,
  didOn,
  fullDate,
  inWeeks,
  marginDay,
  placeHeading,
  placeInSentence,
  shortDate,
  toGo,
  weekdayDate,
  weekInSentence,
  weekRange,
  when,
} from "../../src/lib/labels";

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

test("a date, its year always or never said", () => {
  expect(dayMonth("2025-09-08")).toBe("8 Sept");
  expect(fullDate("2026-09-08")).toBe("8 Sept 2026");
  expect(dayOfMoment("2026-10-03T01:00:00.000Z")).toBe(dayMonth("2026-10-03"));
});

test("when, its date even today and without the weekday's comma", () => {
  const plain = { sayToday: false, weekdayComma: false };
  expect(when(today, "09:00", today, plain)).toBe("Thu 29 Oct, 9:00 am");
  expect(when("2027-01-08", null, today, plain)).toBe("Fri 8 Jan 2027");
  expect(when("2027-01-08", null, today)).toBe("Fri, 8 Jan 2027");
});

test("who did something, and the day", () => {
  const at = "2026-10-03T01:00:00.000Z";
  const day = dayOfMoment(at);
  expect(didOn("Jason", "turned it on", at)).toBe(`Jason turned it on, ${day}`);
  expect(didOn(undefined, "turned it off", at)).toBe(`Turned it off, ${day}`);
  expect(didOn("Sam", "answered", at, { comma: false })).toBe(`Sam answered, ${day}`);
  expect(didOn(null, "answered", at, { comma: false })).toBe(`Answered ${day}`);
});

test("the days to go", () => {
  expect(toGo(today, "2026-11-02")).toBe("4 days to go");
  expect(toGo(today, today)).toBe("due today");
  expect(toGo(today, "2026-10-26")).toBe("3 days past the due date");
  expect(toGo(today, "2026-10-26", { short: true })).toBe("3 days past");
});

test("a week in a sentence, and how far off it is", () => {
  expect(weekInSentence(28)).toBe("week 28");
  expect(inWeeks(0)).toBe("this week");
  expect(inWeeks(-2)).toBe("this week");
  expect(inWeeks(1)).toBe("in 1 week");
  expect(inWeeks(3)).toBe("in 3 weeks");
});
