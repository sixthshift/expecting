import { expect, test } from "vitest";
import { PHASES } from "../../src/app/index";
import type { Phase } from "../../src/lib/timeline";

const phases = Object.keys(PHASES) as Phase[];

test.each(phases)("%s opens at its home, first in its navigation", (phase) => {
  expect(PHASES[phase].pillars[0]?.to).toBe("/");
});

test.each(phases)("%s lists each pillar once", (phase) => {
  const paths = PHASES[phase].pillars.map((p) => p.to);
  expect(new Set(paths).size).toBe(paths.length);
});

test("only the pregnancy has the timeline, and says so", () => {
  expect(phases.filter((s) => PHASES[s].pillars.some((p) => p.label === "Timeline"))).toEqual(["pregnancy"]);
  expect(phases.filter((s) => PHASES[s].timeline)).toEqual(["pregnancy"]);
});
