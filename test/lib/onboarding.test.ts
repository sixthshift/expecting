import { expect, test } from "vitest";
import { ASKS } from "../../src/app/features/settings/model/facts";
import { onboardingSteps, stepAfter } from "../../src/lib/onboarding";

// Before anything is said, every onboarding question, once for each of you where it's about each.
const asked = ASKS.filter((a) => a.question.asked === "onboarding").map((a) => `q:${a.key}`);

test("the first of you gets every step", () => {
  expect(onboardingSteps({ onboarded: false })).toEqual(["due", "baby", ...asked, "extras", "ready"]);
});

test("nothing left to ask once it's set up: the other joins straight in", () => {
  expect(onboardingSteps({ onboarded: true })).toEqual([]);
});

test("after a step comes the next still to ask, from what's left now", () => {
  const steps = onboardingSteps({ onboarded: false });
  expect(stepAfter(steps, "due")).toBe("baby");
  expect(stepAfter(steps, "baby")).toBe(asked[0]);
  expect(stepAfter(steps, "ready")).toBeUndefined();
  // The other phone finished onboarding meanwhile: nothing after.
  expect(stepAfter(onboardingSteps({ onboarded: true }), "due")).toBeUndefined();
});

test("a question about each of you is asked of each, by name in the step", () => {
  const steps = onboardingSteps({ onboarded: false });
  expect(steps).toContain("q:work.carrying");
  expect(steps).toContain("q:work.partner");
});

test("a question depending on another is asked only when its answer fits", () => {
  const steps = (facts: Record<string, string>) => onboardingSteps({ onboarded: false, facts });
  expect(steps({})).toContain("q:previousCaesarean");
  expect(steps({ firstBaby: "no" })).toContain("q:previousCaesarean");
  expect(steps({ firstBaby: "yes" })).not.toContain("q:previousCaesarean");
});
