import { describe, expect, test } from "vitest";
import type { ISODate } from "../../src/lib/dates";
import {
  dayFraction,
  entriesIn,
  formatTime,
  groupEntries,
  type JournalEntry,
  matches,
  movementPattern,
  movementsOffered,
  newestFirst,
  placeOf,
  toTime,
} from "../../src/lib/journal";

const entry = (id: string, day: string, time: string | null = null, createdAt = "2026-10-30T00:00:00Z"): JournalEntry => ({
  id,
  kind: "note",
  day,
  time,
  body: `Note ${id}`,
  different: false,
  by: null,
  createdAt,
  editedBy: null,
  editedAt: null,
});

// Due 19 Jan 2027: week 28 is 27 Oct to 2 Nov 2026; the pregnancy began 14 Apr 2026.
const due = "2027-01-19" as ISODate;

describe("where a day falls", () => {
  test("its week, counted as the timeline counts", () => {
    expect(placeOf("2026-10-27" as ISODate, due)).toBe(28);
    expect(placeOf("2026-11-02" as ISODate, due)).toBe(28);
    expect(placeOf("2026-11-03" as ISODate, due)).toBe(29);
  });

  test("the first days are week 1; before them is before the pregnancy, and past 42 weeks is after", () => {
    expect(placeOf("2026-04-14" as ISODate, due)).toBe(1);
    expect(placeOf("2026-04-13" as ISODate, due)).toBe("before");
    expect(placeOf("2027-02-08" as ISODate, due)).toBe(42);
    expect(placeOf("2027-02-09" as ISODate, due)).toBe("after");
  });

  test("a moved due date moves the week, never the day", () => {
    expect(placeOf("2026-10-30" as ISODate, "2027-01-26" as ISODate)).toBe(27);
  });
});

test("newest first: by day, then time, then when written", () => {
  const ordered = newestFirst([
    entry("a", "2026-10-29", "09:00"),
    entry("b", "2026-10-30", null),
    entry("c", "2026-10-30", "07:00"),
    entry("d", "2026-10-30", "07:00", "2026-10-31T00:00:00Z"),
  ]);
  expect(ordered.map((e) => e.id)).toEqual(["d", "c", "b", "a"]);
});

test("grouped by week, or by month with no due date", () => {
  const entries = [entry("a", "2026-10-30"), entry("b", "2026-10-27"), entry("c", "2026-10-20"), entry("d", "2026-01-01")];
  expect(groupEntries(entries, due).map((g) => [g.place, g.entries.map((e) => e.id)])).toEqual([
    [28, ["a", "b"]],
    [27, ["c"]],
    ["before", ["d"]],
  ]);
  expect(groupEntries(entries, null).map((g) => [g.month, g.entries.length])).toEqual([
    ["2026-10", 3],
    ["2026-01", 1],
  ]);
});

test("a week's entries; none without a due date", () => {
  const entries = [entry("a", "2026-10-30"), entry("c", "2026-10-20")];
  expect(entriesIn(entries, 28, due).map((e) => e.id)).toEqual(["a"]);
  expect(entriesIn(entries, 28, null)).toEqual([]);
});

test("search finds every word, in any case", () => {
  const e = { ...entry("a", "2026-10-30"), body: "Headache again after lunch" };
  expect(matches(e, "")).toBe(true);
  expect(matches(e, "headache LUNCH")).toBe(true);
  expect(matches(e, "headache dinner")).toBe(false);
});

test("times: kept as HH:MM, shown as on a clock", () => {
  expect(toTime("09:30:00")).toBe("09:30");
  expect(toTime("25:00")).toBeNull();
  expect(toTime(undefined)).toBeNull();
  expect(formatTime("00:05")).toBe("12:05 am");
  expect(formatTime("14:15")).toBe("2:15 pm");
});

describe("movements", () => {
  const moved = (id: string, day: string, time: string | null, different = false): JournalEntry => ({
    ...entry(id, day, time),
    kind: "movement",
    body: "",
    different,
  });

  test("offered from week 16, before then once one is kept or with no due date to tell, and never while something has happened", () => {
    expect(movementsOffered({ now: 15, quiet: false, entries: [] })).toBe(false);
    expect(movementsOffered({ now: 16, quiet: false, entries: [] })).toBe(true);
    expect(movementsOffered({ now: 14, quiet: false, entries: [moved("a", "2026-10-30", "21:00")] })).toBe(true);
    expect(movementsOffered({ now: null, quiet: false, entries: [] })).toBe(true);
    expect(movementsOffered({ now: 30, quiet: true, entries: [moved("a", "2026-10-30", "21:00")] })).toBe(false);
  });

  test("the pattern: the last fortnight's days with a movement, newest first, each in time order; notes and older days left out", () => {
    const pattern = movementPattern(
      [
        moved("a", "2026-10-30", "21:15"),
        moved("b", "2026-10-30", "07:40", true),
        moved("c", "2026-10-28", "13:00"),
        moved("d", "2026-10-16", "13:00"),
        moved("e", "2026-10-17", "09:00"),
        entry("n", "2026-10-30", "08:00"),
      ],
      "2026-10-30"
    );
    expect(pattern).toEqual([
      {
        day: "2026-10-30",
        moved: [
          { id: "b", time: "07:40", different: true },
          { id: "a", time: "21:15", different: false },
        ],
      },
      { day: "2026-10-28", moved: [{ id: "c", time: "13:00", different: false }] },
      { day: "2026-10-17", moved: [{ id: "e", time: "09:00", different: false }] },
    ]);
  });

  test("a time's place in the day", () => {
    expect(dayFraction("00:00")).toBe(0);
    expect(dayFraction("12:00")).toBe(0.5);
    expect(dayFraction("18:00")).toBe(0.75);
  });
});
