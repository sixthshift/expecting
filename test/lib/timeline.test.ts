import { describe, expect, test } from "vitest";
import type { ISODate } from "../../src/lib/dates";
import {
  ageLabel,
  allSlots,
  compareSlots,
  dueDateBounds,
  gestationLabel,
  neighbour,
  parseSlotKey,
  positionOn,
  pregnancyWeekStarts,
  slotKey,
  slotLabel,
} from "../../src/lib/timeline";

const due = "2027-03-01" as ISODate;

describe("positionOn", () => {
  test("on the due date it is 40+0, week 40", () => {
    expect(positionOn(due, due)).toEqual({ slot: { phase: "pregnancy", week: 40 }, gestationDays: 280 });
  });

  test("weeks are completed weeks: 28+6 is still week 28", () => {
    // 280 - 28*7 - 6 = 78 days before the due date
    const today = "2026-12-13" as ISODate;
    const p = positionOn(today, due);
    expect(p.slot).toEqual({ phase: "pregnancy", week: 28 });
    expect(gestationLabel(p.gestationDays!)).toBe("28+6");
  });

  test("more than 40 weeks out is before", () => {
    expect(positionOn("2026-05-01" as ISODate, due).slot).toEqual({ phase: "before" });
  });

  test("the first days count as week 1, not week 0", () => {
    expect(positionOn("2026-05-26" as ISODate, due).slot).toEqual({ phase: "pregnancy", week: 1 });
  });

  test("past the due date with no birth, pregnancy runs to week 42", () => {
    expect(positionOn("2027-03-20" as ISODate, due).slot).toEqual({ phase: "pregnancy", week: 42 });
  });

  test("past week 42 with no birth date, the due date stands in for the birth", () => {
    const p = positionOn("2027-03-16" as ISODate, due);
    expect(p.slot).toEqual({ phase: "pregnancy", week: 42 });
    const later = positionOn("2027-03-22" as ISODate, due);
    expect(later.slot).toEqual({ phase: "postpartum", week: 4 });
    expect(later.birthAssumed).toBe(true);
  });

  test("a birth date moves to postpartum from that day, counted from the birth", () => {
    const birth = "2027-02-10" as ISODate;
    expect(positionOn(birth, due, birth)).toMatchObject({ slot: { phase: "postpartum", week: 1 }, daysSinceBirth: 0, birthAssumed: false });
    expect(positionOn("2027-02-17" as ISODate, due, birth).slot).toEqual({ phase: "postpartum", week: 2 });
  });

  test("postpartum stops at week 12", () => {
    expect(positionOn("2027-12-01" as ISODate, due, "2027-02-10" as ISODate).slot).toEqual({ phase: "postpartum", week: 12 });
  });

  test("a birth date in the future is ignored until it arrives", () => {
    expect(positionOn("2027-02-01" as ISODate, due, "2027-02-10" as ISODate).slot).toEqual({ phase: "pregnancy", week: 36 });
  });
});

describe("slots", () => {
  test("the timeline runs before, 42 pregnancy weeks, 12 after", () => {
    const slots = allSlots();
    expect(slots).toHaveLength(1 + 42 + 12);
    for (let i = 1; i < slots.length; i++) expect(compareSlots(slots[i - 1]!, slots[i]!)).toBeLessThan(0);
  });

  test("keys round-trip", () => {
    for (const slot of allSlots()) expect(parseSlotKey(slotKey(slot))).toEqual(slot);
  });

  test.each(["0", "43", "pp0", "pp13", "week-3", "", "28.5"])("%s is not a slot", (key) => {
    expect(parseSlotKey(key)).toBeNull();
  });

  test("neighbours cross phases and stop at the ends", () => {
    expect(neighbour({ phase: "before" }, -1)).toBeNull();
    expect(neighbour({ phase: "before" }, 1)).toEqual({ phase: "pregnancy", week: 1 });
    expect(neighbour({ phase: "pregnancy", week: 42 }, 1)).toEqual({ phase: "postpartum", week: 1 });
    expect(neighbour({ phase: "postpartum", week: 12 }, 1)).toBeNull();
  });

  test("labels", () => {
    expect(slotLabel({ phase: "pregnancy", week: 28 })).toBe("Week 28");
    expect(slotLabel({ phase: "postpartum", week: 3 })).toBe("Week 3 after birth");
  });

  test("a pregnancy week starts on its N+0 day", () => {
    expect(pregnancyWeekStarts(40, due)).toBe(due);
    expect(pregnancyWeekStarts(39, due)).toBe("2027-02-22");
  });
});

test("the baby's age reads as people say it", () => {
  expect(ageLabel(0)).toBe("Born today");
  expect(ageLabel(1)).toBe("1 day old");
  expect(ageLabel(12)).toBe("12 days old");
});

test("a due date is accepted from three weeks past to 44 weeks ahead", () => {
  expect(dueDateBounds("2026-10-27" as ISODate)).toEqual({ minDate: "2026-10-06", maxDate: "2027-08-31" });
});
