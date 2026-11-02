import { expect, test } from "vitest";
import { addDays, type ISODate } from "../../src/lib/dates";
import { cravingsRecord, feelingsRecord, movementsRecord, recordsText, sicknessRecord } from "../../src/lib/records";
import { appetite, DUE, entry, feeling } from "./storyFixtures";

/** Week `w`, day `d` of the fixtures' pregnancy. */
const on = (w: number, d = 0) => addDays(addDays(DUE, -280), w * 7 + d);
// Thursday of week 30.
const today = on(30, 3) as ISODate;

test("nothing kept, no record: never what's missing", () => {
  expect(movementsRecord([], today, DUE)).toBeNull();
  expect(sicknessRecord([], today, DUE)).toBeNull();
  expect(cravingsRecord([], today)).toBeNull();
  expect(feelingsRecord([], [{ id: "sam", name: "Sam" }], "sam", today)).toBeNull();
});

test("movements: days of the last fortnight; felt as different first, the parts of the day, the last, and since when", () => {
  const journal = [
    entry("movement", on(20, 1), { time: "09:00" }),
    entry("movement", on(29, 1), { time: "08:30" }),
    entry("movement", on(29, 6), { time: "21:00" }),
    entry("movement", on(30, 1), { time: "07:45" }),
    entry("movement", on(30, 2), { time: "20:15", different: true }),
    entry("note", on(30, 2)),
  ];
  expect(movementsRecord(journal, today, DUE)).toEqual({
    headline: "4 of the last 14 days",
    lines: [
      "Felt as slower, weaker or stopped yesterday.",
      "Usually in the morning and the evening.",
      "Last kept yesterday, 8:15 pm.",
      "First kept in week 20.",
    ],
    lately: true,
  });
  // Long ago: said as none lately, and not first.
  expect(movementsRecord([entry("movement", on(20, 1))], today, DUE)).toMatchObject({ headline: "None in the last 14 days", lately: false });
});

test("sickness: each spell, the week with most, the worst, and none since", () => {
  const kept = [
    appetite("sick", on(8, 0), { how: "queasy" }),
    appetite("sick", on(9, 0), { how: "vomited" }),
    appetite("sick", on(9, 1), { how: "queasy" }),
    appetite("sick", on(9, 2), { how: "fluids" }),
    appetite("sick", on(9, 2), { how: "queasy" }),
    appetite("sick", on(12, 4), { how: "queasy" }),
    appetite("craving", on(9, 1), { what: "Pickles" }),
  ];
  expect(sicknessRecord(kept, today, DUE)).toEqual({
    headline: "None since week 12",
    lines: [
      "Kept on 4 days, from week 8 to week 9.",
      "Again on 1 day, in week 12.",
      "Most in week 9: 3 days.",
      "Threw up on 2 days.",
      "Couldn't keep fluids down on 1 day.",
    ],
    lately: false,
  });
  // Weeks with the most that run on, said as a run.
  const even = [8, 9, 10].flatMap((w) => [appetite("sick", on(w, 0), { how: "queasy" }), appetite("sick", on(w, 1), { how: "queasy" })]);
  expect(sicknessRecord(even, today, DUE)?.lines[1]).toBe("Most in weeks 8 to 10: 2 days each.");
  // Still going: how many days lately, and the last.
  expect(sicknessRecord([appetite("sick", on(30, 2), { how: "queasy" })], today, DUE)).toEqual({
    headline: "1 of the last 14 days",
    lines: ["Kept on 1 day, in week 30.", "Last kept yesterday."],
    lately: true,
  });
});

test("cravings and gone off: most often first, the same thing however it was typed", () => {
  const kept = [
    appetite("craving", on(10, 0), { what: "Pickles" }),
    appetite("craving", on(12, 0), { what: " pickles " }),
    appetite("craving", on(14, 0), { what: "pickles" }),
    appetite("craving", on(15, 0), { what: "Ice" }),
    appetite("off", on(9, 0), { what: "Coffee" }),
  ];
  expect(cravingsRecord([...kept, appetite("craving", on(16, 0), { what: "ice" }), appetite("craving", on(17, 0), { what: "Ice" })], today)?.headline).toBe(
    "Ice and pickles"
  );
  expect(cravingsRecord(kept, today)).toEqual({ headline: "Pickles", lines: ["Craved: pickles (3 times) and Ice.", "Gone off: Coffee."], lately: false });
});

test("feelings: you first, then the other, over four weeks; your words only from your own", () => {
  const people = [
    { id: "alex", name: "Alex" },
    { id: "sam", name: "Sam" },
  ];
  const feelings = [
    { ...feeling("sam", on(29, 0), { step: "good" }), words: ["tired" as const, "happy" as const], note: null },
    { ...feeling("sam", on(30, 0), { step: "good" }), words: ["tired" as const], note: null },
    { ...feeling("sam", on(30, 1), { step: "low" }), words: [], note: null },
    feeling("alex", on(30, 2), { step: "great" }),
    // Over four weeks ago: not counted.
    feeling("alex", on(20, 0), { step: "rough" }),
  ];
  expect(feelingsRecord(feelings, people, "sam", today)).toEqual({
    headline: "Mostly good",
    lines: [
      "You: checked in on 3 days of the last four weeks, mostly good.",
      "Your words most: tired and happy.",
      "Alex: checked in on 1 day of the last four weeks, mostly great.",
    ],
    lately: true,
  });
});

test("as text, to paste: a heading, each record with its answer and lines, then the papers", () => {
  const text = recordsText({
    heading: "Records at week 30",
    records: [{ title: "Movements", record: { headline: "4 of the last 14 days", lines: ["Last kept yesterday."], lately: true } }],
    papers: ["Birth plan"],
  });
  expect(text).toBe("Records at week 30\n\nMovements: 4 of the last 14 days\n- Last kept yesterday.\n\nPapers kept\n- Birth plan");
});
