import { expect, test } from "vitest";
import { PROFILE } from "../../src/content/profile";
import { onboardingSteps } from "../../src/lib/onboarding";

const asked = PROFILE.filter((q) => q.asked === "onboarding" && q.id !== "stage").map((q) => `q:${q.id}`);

test("profile.yaml asks the stage first, expecting or getting ready", () => {
  const stage = PROFILE.find((q) => q.id === "stage");
  expect(stage?.asked).toBe("onboarding");
  expect(Object.keys(stage!.answers).sort()).toEqual(["pregnant", "trying"]);
});

test("a new household on a new phone gets every step", () => {
  expect(onboardingSteps({ known: false, onboarded: false, profile: {} })).toEqual(["who", "stage", "due", "baby", ...asked, "ready"]);
});

test("getting ready skips the due date and the baby", () => {
  expect(onboardingSteps({ known: true, onboarded: false, profile: { stage: "trying" } })).toEqual(["stage", ...asked, "ready"]);
});

test("the second parent's phone only asks who they are", () => {
  expect(onboardingSteps({ known: false, onboarded: true, profile: {} })).toEqual(["who"]);
});

test("nothing left to ask once both are known", () => {
  expect(onboardingSteps({ known: true, onboarded: true, profile: {} })).toEqual([]);
});
