import { describe, expect, test } from "vitest";
import type { ISODate } from "../../../src/lib/dates";
import { asOne, dayFraction, entriesIn, type JournalEntry, movementPattern, movementsOffered, newestFirst } from "../../../src/lib/journal/journal";

const entry = (id: string, day: string, time: string | null = null, createdAt = "2026-10-30T00:00:00Z"): JournalEntry => ({
  id,
  kind: "note",
  day,
  time,
  body: `Note ${id}`,
  different: false,
  fromBoth: false,
  by: null,
  createdAt,
  editedBy: null,
  editedAt: null,
});

// Due 19 Jan 2027: week 28 is 27 Oct to 2 Nov 2026; the pregnancy began 14 Apr 2026.
const due = "2027-01-19" as ISODate;

test("newest first: by day, then time, then when written", () => {
  const ordered = newestFirst([
    entry("a", "2026-10-29", "09:00"),
    entry("b", "2026-10-30", null),
    entry("c", "2026-10-30", "07:00"),
    entry("d", "2026-10-30", "07:00", "2026-10-31T00:00:00Z"),
  ]);
  expect(ordered.map((e) => e.id)).toEqual(["d", "c", "b", "a"]);
});

test("a week's entries; none without a due date", () => {
  const entries = [entry("a", "2026-10-30"), entry("c", "2026-10-20")];
  expect(entriesIn(entries, 28, due).map((e) => e.id)).toEqual(["a"]);
  expect(entriesIn(entries, 28, null)).toEqual([]);
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

  test("two kept within five minutes are one movement (both of you, the same kick), felt as different if either was", () => {
    const pattern = movementPattern(
      [moved("a", "2026-10-30", "21:15"), moved("b", "2026-10-30", "21:18", true), moved("c", "2026-10-30", "21:20"), moved("d", "2026-10-30", "21:21")],
      "2026-10-30"
    );
    expect(pattern[0]!.moved).toEqual([
      { id: "a", time: "21:15", different: true },
      { id: "d", time: "21:21", different: false },
    ]);
    expect(asOne([])).toEqual([]);
  });

  test("a time's place in the day", () => {
    expect(dayFraction("00:00")).toBe(0);
    expect(dayFraction("12:00")).toBe(0.5);
    expect(dayFraction("18:00")).toBe(0.75);
  });
});
