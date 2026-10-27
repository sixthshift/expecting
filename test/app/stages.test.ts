import { expect, test } from "vitest";
import { STAGES } from "../../src/app/index";
import type { Stage } from "../../src/lib/stage";

const stages = Object.keys(STAGES) as Stage[];

test.each(stages)("%s opens at its home, first in its navigation", (stage) => {
  expect(STAGES[stage].pillars[0]?.to).toBe("/");
});

test.each(stages)("%s lists each pillar once", (stage) => {
  const paths = STAGES[stage].pillars.map((p) => p.to);
  expect(new Set(paths).size).toBe(paths.length);
});

test("only the pregnancy has the timeline", () => {
  expect(stages.filter((s) => STAGES[s].pillars.some((p) => p.label === "Timeline"))).toEqual(["pregnancy"]);
});
