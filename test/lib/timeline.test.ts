import { describe, expect, test } from "vitest";
import type { ISODate } from "../../src/lib/dates";
import { allWeeks, dueDateBounds, gestationLabel, parseWeekKey, positionOn, weekDates, weekLabel, weekStarts } from "../../src/lib/timeline";

const due = "2027-03-01" as ISODate;

describe("positionOn", () => {
  test("on the due date it is 40+0, week 40", () => {
    expect(positionOn(due, due)).toEqual({ week: 40, gestationDays: 280 });
  });

  test("weeks are completed weeks: 28+6 is still week 28", () => {
    // 280 - 28*7 - 6 = 78 days before the due date
    const today = "2026-12-13" as ISODate;
    const p = positionOn(today, due);
    expect(p.week).toBe(28);
    expect(gestationLabel(p.gestationDays)).toBe("28+6");
  });

  test("more than 40 weeks out reads as week 1, at 0+0", () => {
    expect(positionOn("2026-05-01" as ISODate, due)).toEqual({ week: 1, gestationDays: 0 });
  });

  test("the first days count as week 1, not week 0", () => {
    expect(positionOn("2026-05-26" as ISODate, due).week).toBe(1);
  });

  test("past the due date, the pregnancy runs to week 42 and stays there", () => {
    expect(positionOn("2027-03-20" as ISODate, due).week).toBe(42);
    expect(positionOn("2027-06-01" as ISODate, due).week).toBe(42);
  });
});

describe("weeks", () => {
  test("the timeline runs weeks 1 to 42", () => {
    expect(allWeeks()).toEqual(Array.from({ length: 42 }, (_, i) => i + 1));
  });

  test("keys round-trip", () => {
    for (const week of allWeeks()) expect(parseWeekKey(String(week))).toBe(week);
  });

  test.each(["0", "43", "pp3", "preconception", "week-3", "", "28.5"])("%s is not a week", (key) => {
    expect(parseWeekKey(key)).toBeNull();
  });

  test("labels", () => {
    expect(weekLabel(28)).toBe("Week 28");
  });

  test("a week starts on its N+0 day, and covers seven", () => {
    expect(weekStarts(40, due)).toBe(due);
    expect(weekStarts(39, due)).toBe("2027-02-22");
    expect(weekDates(39, due)).toEqual({ start: "2027-02-22", end: "2027-02-28" });
    expect(weekDates(39, null)).toBeNull();
  });
});

test("a due date is accepted from three weeks past to 44 weeks ahead", () => {
  expect(dueDateBounds("2026-10-27" as ISODate)).toEqual({ minDate: "2026-10-06", maxDate: "2027-08-31" });
});
