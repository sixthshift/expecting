import { expect, test } from "vitest";
import { feelingsSummary } from "../../../../src/lib/journal/summaries/feelings";
import { feeling } from "../storyFixtures";
import { on, today } from "./days";

test("nothing kept, no record: never what's missing", () => {
  expect(feelingsSummary([], [{ id: "sam", name: "Sam" }], "sam", today)).toBeNull();
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
  expect(feelingsSummary(feelings, people, "sam", today)).toEqual({
    headline: "Mostly good",
    lines: [
      "You: checked in on 3 days of the last four weeks, mostly good.",
      "Your words most: tired and happy.",
      "Alex: checked in on 1 day of the last four weeks, mostly great.",
    ],
    lately: true,
  });
});
