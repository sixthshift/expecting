import { expect, test } from "vitest";
import { cravingsSummary } from "../../../../src/lib/journal/summaries/cravings";
import { appetite } from "../storyFixtures";
import { on, today } from "./days";

test("nothing kept, no record: never what's missing", () => {
  expect(cravingsSummary([], today)).toBeNull();
});

test("cravings and gone off: most often first, the same thing however it was typed", () => {
  const kept = [
    appetite("craving", on(10, 0), { what: "Pickles" }),
    appetite("craving", on(12, 0), { what: " pickles " }),
    appetite("craving", on(14, 0), { what: "pickles" }),
    appetite("craving", on(15, 0), { what: "Ice" }),
    appetite("off", on(9, 0), { what: "Coffee" }),
  ];
  expect(cravingsSummary([...kept, appetite("craving", on(16, 0), { what: "ice" }), appetite("craving", on(17, 0), { what: "Ice" })], today)?.headline).toBe(
    "Ice and pickles"
  );
  expect(cravingsSummary(kept, today)).toEqual({ headline: "Pickles", lines: ["Craved: pickles (3 times) and Ice.", "Gone off: Coffee."], lately: false });
});
