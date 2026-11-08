import { expect, test } from "vitest";
import { firstsSummary } from "../../../../src/lib/journal/summaries/firsts";
import { DUE, first } from "../storyFixtures";
import { on, today } from "./days";

test("firsts: how many of them are kept and the latest; none marked, no record", () => {
  const firsts = firstsSummary([first("found-out", on(4, 2)), first("first-kick", on(19, 2))], true, today, DUE);
  expect(firsts?.headline).toBe("2 of 13 kept");
  expect(firsts?.lines[0]).toBe("The latest: felt the first kick, week 19.");
  expect(firstsSummary([], true, today, DUE)).toBeNull();
});
