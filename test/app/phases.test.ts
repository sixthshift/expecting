import { expect, test } from "vitest";
import { PHASES } from "../../src/features/phases/index";
import type { Phase } from "../../src/lib/timeline";

const phases = Object.keys(PHASES) as Phase[];

test.each(phases)("%s opens at its home, first in its navigation", (phase) => {
  expect(PHASES[phase].pillars[0]?.to).toBe(`/${phase}`);
});

test.each(phases)("%s keeps every pillar under its own path", (phase) => {
  for (const { to } of PHASES[phase].pillars) expect(to === `/${phase}` || to.startsWith(`/${phase}/`), to).toBe(true);
});

test.each(phases)("%s lists each pillar once", (phase) => {
  const paths = PHASES[phase].pillars.map((p) => p.to);
  expect(new Set(paths).size).toBe(paths.length);
});

test("only the pregnancy has the timeline, and says so", () => {
  expect(phases.filter((s) => PHASES[s].pillars.some((p) => p.label === "Timeline"))).toEqual(["pregnancy"]);
  expect(phases.filter((s) => PHASES[s].timeline)).toEqual(["pregnancy"]);
});
