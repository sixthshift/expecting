import { describe, expect, test } from "vitest";
import type { ISODate } from "../../src/lib/dates";
import { hardFortnight, latestOn, type OwnFeeling, type Step, stepsByDay, type Word, weekStep, wordsUsed } from "../../src/lib/feelings";

const SAM = "sam";
const ALEX = "alex";
const TODAY: ISODate = "2026-10-30";

let n = 0;
function f(day: string, step: Step, words: Word[] = [], time: string | null = "20:00", by = SAM): OwnFeeling {
  n += 1;
  return { id: `f${n}`, by, day, time, step, words, note: null, createdAt: `${day}T10:00:00.000Z` };
}

describe("a day's feeling", () => {
  test("is the latest that day, by its time, for its person", () => {
    const feelings = [f(TODAY, "low", [], "21:00"), f(TODAY, "good", [], "08:00"), f(TODAY, "great", [], "23:00", ALEX)];
    expect(latestOn(feelings, SAM, TODAY)?.step).toBe("low");
    expect(latestOn(feelings, ALEX, TODAY)?.step).toBe("great");
    expect(latestOn(feelings, SAM, "2026-10-29")).toBeUndefined();
  });

  test("the dots are each day up to today, with a gap where there's none", () => {
    const steps = stepsByDay([f("2026-10-28", "okay"), f(TODAY, "good")], SAM, TODAY, 3);
    expect(steps).toEqual([
      { day: "2026-10-28", step: "okay" },
      { day: "2026-10-29", step: null },
      { day: TODAY, step: "good" },
    ]);
  });
});

test("the words used most, by days, not by times", () => {
  const feelings = [
    f("2026-10-28", "low", ["tired", "anxious"]),
    f(TODAY, "low", ["tired"], "08:00"),
    f(TODAY, "okay", ["tired"], "20:00"),
    f("2026-09-01", "low", ["teary"]),
  ];
  expect(wordsUsed(feelings, "2026-10-01")).toEqual([
    { word: "tired", days: 2 },
    { word: "anxious", days: 1 },
  ]);
});

test("a week's step is the middle of its days', each day its latest", () => {
  const feelings = [
    f("2026-10-26", "rough"),
    f("2026-10-27", "good", [], "08:00"),
    f("2026-10-27", "okay", [], "21:00"),
    f("2026-10-28", "great"),
    f("2026-11-03", "rough"),
  ];
  expect(weekStep(feelings, SAM, "2026-10-26", "2026-11-01")).toBe("okay");
  expect(weekStep(feelings, ALEX, "2026-10-26", "2026-11-01")).toBeNull();
});

describe("a hard fortnight", () => {
  const days = (count: number, step: Step, words: Word[] = []) =>
    Array.from({ length: count }, (_, i) => f(`2026-10-${String(30 - i).padStart(2, "0")}`, step, words));

  test("says nothing with fewer than four days checked in", () => {
    expect(hardFortnight(days(3, "rough"), TODAY)).toBe(false);
    expect(hardFortnight(days(4, "rough"), TODAY)).toBe(true);
  });

  test("needs most of the days low: half is not most", () => {
    expect(hardFortnight([...days(2, "low"), f("2026-10-28", "good"), f("2026-10-27", "okay")], TODAY)).toBe(false);
    expect(hardFortnight([...days(3, "low"), f("2026-10-27", "okay")], TODAY)).toBe(true);
  });

  test("counts a day by how it ended", () => {
    const mornings = days(4, "rough").map((x) => ({ ...x, time: "08:00" }));
    const evenings = days(4, "good").map((x) => ({ ...x, time: "21:00" }));
    expect(hardFortnight([...mornings, ...evenings], TODAY)).toBe(false);
  });

  test("anxious on most days counts, whatever the step", () => {
    expect(hardFortnight(days(4, "good", ["anxious"]), TODAY)).toBe(true);
    expect(hardFortnight([...days(2, "good", ["anxious"]), f("2026-10-28", "good"), f("2026-10-27", "good")], TODAY)).toBe(false);
  });

  test("looks back fourteen days, today among them", () => {
    const old = ["2026-10-16", "2026-10-15", "2026-10-14", "2026-10-13"].map((d) => f(d, "rough"));
    expect(hardFortnight(old, TODAY)).toBe(false);
    const edge = ["2026-10-17", "2026-10-18", "2026-10-19", "2026-10-20"].map((d) => f(d, "rough"));
    expect(hardFortnight(edge, TODAY)).toBe(true);
  });
});
