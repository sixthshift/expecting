import { expect, test } from "vitest";
import { movementsSummary } from "../../../../src/lib/journal/summaries/movements";
import { DUE, entry } from "../storyFixtures";
import { on, today } from "./days";

test("nothing kept, no record: never what's missing", () => {
  expect(movementsSummary([], today, DUE)).toBeNull();
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
  expect(movementsSummary(journal, today, DUE)).toEqual({
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
  expect(movementsSummary([entry("movement", on(20, 1))], today, DUE)).toMatchObject({ headline: "None in the last 14 days", lately: false });
});
