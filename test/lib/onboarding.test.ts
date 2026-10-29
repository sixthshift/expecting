import { expect, test } from "vitest";
import { ASKS } from "../../src/content/facts";
import { onboardingSteps, stepAfter } from "../../src/lib/onboarding";

// Before anything is said, every onboarding question, once for each of you where it's about each.
const asked = ASKS.filter((a) => a.question.asked === "onboarding").map((a) => `q:${a.key}`);

test("a new household on a new phone gets every step", () => {
  expect(onboardingSteps({ known: false, onboarded: false })).toEqual(["who", "due", "baby", ...asked, "extras", "ready"]);
});

test("the second parent's phone only asks who they are", () => {
  expect(onboardingSteps({ known: false, onboarded: true })).toEqual(["who"]);
});

test("nothing left to ask once both are known", () => {
  expect(onboardingSteps({ known: true, onboarded: true })).toEqual([]);
});

test("after a step comes the next still to ask, from what's left now", () => {
  const steps = onboardingSteps({ known: true, onboarded: false });
  expect(stepAfter(steps, "due")).toBe("baby");
  expect(stepAfter(steps, "baby")).toBe(asked[0]);
  expect(stepAfter(steps, "ready")).toBeUndefined();
  // Once this phone says who it is, "who" has left the list, and what follows it is still found.
  expect(stepAfter(steps, "who")).toBe("due");
  // The other phone finished onboarding meanwhile: nothing after "who".
  expect(stepAfter(onboardingSteps({ known: true, onboarded: true }), "who")).toBeUndefined();
});

test("a question about each of you is asked of each, by name in the step", () => {
  const steps = onboardingSteps({ known: true, onboarded: false });
  expect(steps).toContain("q:work.carrying");
  expect(steps).toContain("q:work.partner");
});

test("a question depending on another is asked only when its answer fits", () => {
  const steps = (facts: Record<string, string>) => onboardingSteps({ known: true, onboarded: false, facts });
  expect(steps({})).toContain("q:previousCaesarean");
  expect(steps({ firstBaby: "no" })).toContain("q:previousCaesarean");
  expect(steps({ firstBaby: "yes" })).not.toContain("q:previousCaesarean");
});
