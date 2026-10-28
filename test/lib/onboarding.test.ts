import { expect, test } from "vitest";
import { PROFILE } from "../../src/content/profile";
import { onboardingSteps, stepAfter } from "../../src/lib/onboarding";

const asked = PROFILE.filter((q) => q.asked === "onboarding" && q.id !== "expecting").map((q) => `q:${q.id}`);

test("profile.yaml asks first whether you're expecting, or getting ready", () => {
  const expecting = PROFILE.find((q) => q.id === "expecting");
  expect(expecting?.asked).toBe("onboarding");
  expect(Object.keys(expecting!.answers).sort()).toEqual(["not-yet", "yes"]);
});

test("a new household on a new phone gets every step", () => {
  expect(onboardingSteps({ known: false, onboarded: false, profile: {} })).toEqual(["who", "expecting", "due", "baby", ...asked, "ready"]);
});

test("getting ready skips the due date and the baby", () => {
  expect(onboardingSteps({ known: true, onboarded: false, profile: { expecting: "not-yet" } })).toEqual(["expecting", ...asked, "ready"]);
});

test("the second parent's phone only asks who they are", () => {
  expect(onboardingSteps({ known: false, onboarded: true, profile: {} })).toEqual(["who"]);
});

test("nothing left to ask once both are known", () => {
  expect(onboardingSteps({ known: true, onboarded: true, profile: {} })).toEqual([]);
});

test("after a step comes the next still to ask, from what's left now", () => {
  const expecting = onboardingSteps({ known: true, onboarded: false, profile: { expecting: "yes" } });
  expect(stepAfter(expecting, "expecting")).toBe("due");
  expect(stepAfter(expecting, "baby")).toBe(asked[0]);
  expect(stepAfter(expecting, "ready")).toBeUndefined();
  // "Not yet": the due date and the colours aren't asked, so the questions come next.
  const gettingReady = onboardingSteps({ known: true, onboarded: false, profile: { expecting: "not-yet" } });
  expect(stepAfter(gettingReady, "expecting")).toBe(asked[0]);
  // Once this phone says who it is, "who" has left the list, and what follows it is still found.
  expect(stepAfter(expecting, "who")).toBe("expecting");
});
