import { expect, test } from "vitest";
import { sicknessSummary } from "../../../../src/lib/journal/summaries/sickness";
import { appetite, DUE } from "../storyFixtures";
import { on, today } from "./days";

test("nothing kept, no record: never what's missing", () => {
  expect(sicknessSummary([], today, DUE)).toBeNull();
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
  expect(sicknessSummary(kept, today, DUE)).toEqual({
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
  expect(sicknessSummary(even, today, DUE)?.lines[1]).toBe("Most in weeks 8 to 10: 2 days each.");
  // Still going: how many days lately, and the last.
  expect(sicknessSummary([appetite("sick", on(30, 2), { how: "queasy" })], today, DUE)).toEqual({
    headline: "1 of the last 14 days",
    lines: ["Kept on 1 day, in week 30.", "Last kept yesterday."],
    lately: true,
  });
});
