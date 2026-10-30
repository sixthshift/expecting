import { describe, expect, test } from "vitest";
import {
  type AppetiteEntry,
  cravingChips,
  isWhole,
  notFood,
  notFoodQuestion,
  oftenQuestion,
  describe as say,
  sicknessSince,
  sicknessWeeks,
  sickOften,
  tally,
  weekAppetite,
} from "../../src/lib/appetite";
import type { ISODate } from "../../src/lib/dates";

let n = 0;
function entry(day: string, rest: Partial<AppetiteEntry>): AppetiteEntry {
  n += 1;
  return {
    id: `e${n}`,
    kind: "sick",
    day,
    time: "08:00",
    how: "queasy",
    what: null,
    note: null,
    by: null,
    createdAt: `${day}T00:00:00.000Z`,
    editedBy: null,
    editedAt: null,
    ...rest,
  };
}
const sick = (day: string, how: AppetiteEntry["how"] = "queasy", time = "08:00") => entry(day, { how, time });
const craved = (day: string, what: string) => entry(day, { kind: "craving", how: null, what });

const TODAY = "2026-10-30" as ISODate;
// Due 2027-01-22, so week 28 starts today, 2026-10-30.
const DUE = "2027-01-22" as ISODate;

describe("what an entry needs", () => {
  test("sickness says how bad; a craving says what", () => {
    expect(isWhole({ id: "a", kind: "sick", day: TODAY, time: null, how: "queasy", what: null, note: null })).toBe(true);
    expect(isWhole({ id: "a", kind: "sick", day: TODAY, time: null, how: null, what: "x", note: null })).toBe(false);
    expect(isWhole({ id: "a", kind: "craving", day: TODAY, time: null, how: null, what: "  ", note: null })).toBe(false);
    expect(isWhole({ id: "a", kind: "off", day: TODAY, time: null, how: "fluids", what: "Coffee", note: null })).toBe(true);
  });

  test("is said plainly", () => {
    expect(say({ kind: "sick", how: "vomited", what: null })).toBe("Threw up");
    expect(say({ kind: "craving", how: null, what: "Pickles" })).toBe("Craving: Pickles");
    expect(say({ kind: "off", how: null, what: "Coffee" })).toBe("Gone off: Coffee");
  });
});

describe("since when", () => {
  test("the first day and the latest entry; nothing without sickness", () => {
    expect(sicknessSince([craved(TODAY, "Pickles")])).toBeNull();
    const last = sick("2026-10-29", "vomited", "03:10");
    expect(sicknessSince([sick("2026-09-08"), last, sick("2026-10-29", "queasy", "01:00"), craved(TODAY, "Ice")])).toEqual({ first: "2026-09-08", last });
  });
});

describe("the weeks", () => {
  test("pregnancy weeks from the first sickness to today, newest first, each day's worst", () => {
    const weeks = sicknessWeeks([sick("2026-10-24"), sick("2026-10-24", "fluids"), sick("2026-10-30", "vomited"), sick("2026-10-31")], TODAY, DUE);
    expect(weeks.map((w) => [w.place, w.start, w.end])).toEqual([
      [28, "2026-10-30", "2026-11-05"],
      [27, "2026-10-23", "2026-10-29"],
    ]);
    expect(weeks[1]!.days.find((d) => d.day === "2026-10-24")?.worst).toBe("fluids");
    expect(weeks[1]).toMatchObject({ sickDays: 1, threwUpDays: 1 });
    // Today counts; a day still to come is ahead, and one wrongly kept there isn't hidden.
    expect(weeks[0]!.days[0]).toEqual({ day: TODAY, worst: "vomited", ahead: false });
    expect(weeks[0]!.days[1]).toMatchObject({ ahead: true, worst: "queasy" });
  });

  test("without a due date, runs of seven days ending today", () => {
    const weeks = sicknessWeeks([sick("2026-10-20")], TODAY, null);
    expect(weeks.map((w) => [w.place, w.start, w.end])).toEqual([
      [null, "2026-10-24", TODAY],
      [null, "2026-10-17", "2026-10-23"],
    ]);
    expect(weeks[0]!.days.every((d) => !d.ahead)).toBe(true);
  });

  test("empty with no sickness kept", () => {
    expect(sicknessWeeks([craved(TODAY, "Ice")], TODAY, DUE)).toEqual([]);
  });
});

describe("sick often", () => {
  test("threw up on four of the last seven days; queasy days don't count", () => {
    const days = ["2026-10-30", "2026-10-29", "2026-10-27"].map((d) => sick(d, "vomited"));
    expect(sickOften([...days, sick("2026-10-28"), sick("2026-10-28")], TODAY)).toBeNull();
    expect(sickOften([...days, sick("2026-10-24", "fluids")], TODAY)).toBe(4);
    // A week ago is outside it.
    expect(sickOften([...days, sick("2026-10-23", "vomited")], TODAY)).toBeNull();
  });

  test("its question carries the facts", () => {
    expect(oftenQuestion(5, "8 Sep")).toBe("I've been sick on 5 of the last 7 days, since 8 Sep. What can help?");
  });
});

describe("cravings", () => {
  test("tallied whatever the case, most first, named as last written", () => {
    const entries = [
      craved("2026-10-01", "pickles"),
      craved("2026-10-20", "Pickles "),
      craved("2026-10-25", "Ice"),
      entry("2026-10-02", { kind: "off", how: null, what: "Coffee" }),
    ];
    expect(tally(entries, "craving")).toEqual([
      { what: "Pickles ", times: 2, first: "2026-10-01", last: "2026-10-20" },
      { what: "Ice", times: 1, first: "2026-10-25", last: "2026-10-25" },
    ]);
    expect(tally(entries, "off").map((t) => t.what)).toEqual(["Coffee"]);
    expect(cravingChips(entries)).toEqual(["Pickles ", "Ice"]);
  });

  test("things that aren't food, as whole words: ice, but not ice cream", () => {
    for (const what of ["Ice", "chewing ice", "ice cubes", "Chalk!", "clay", "dirt", "the smell of soap", "Cornflour"]) expect(notFood(what), what).toBe(true);
    for (const what of ["ice cream", "Iced coffee", "an ice block", "pickles", "rice", "Paddle Pop", "chocolate"]) expect(notFood(what), what).toBe(false);
    expect(notFoodQuestion(" Ice ")).toBe("I've been craving ice. Should my iron be checked?");
  });
});

test("a week as the timeline says it: the days with sickness, and the most kept craving", () => {
  const entries = [
    sick("2026-10-30"),
    sick("2026-10-30", "vomited"),
    sick("2026-11-01"),
    craved("2026-10-31", "Olives"),
    craved("2026-11-02", "Ice"),
    craved("2026-11-03", "ice"),
  ];
  expect(weekAppetite(entries, 28, DUE)).toEqual({ sick: 2, craved: "ice" });
  expect(weekAppetite(entries, 27, DUE)).toEqual({ sick: 0, craved: null });
  expect(weekAppetite(entries, 28, null)).toEqual({ sick: 0, craved: null });
});
