// The first-run questions, as steps. Pure: which steps a device sees follows
// from what is already known, so a reload resumes where it left off and the
// second parent's phone asks only who they are.
//
//   who        which person is holding this phone (every new device)
//   expecting  expecting yet, or getting ready (the household, once)
//   due        the due date, when expecting
//   baby       boy, girl or don't know: the colours, when expecting
//   q:<id>     the rest of content/profile.yaml's `asked: onboarding` questions
//   ready      where Expecting will open, and in

import { PROFILE, type Profile } from "../content/profile";

export type Step = "who" | "expecting" | "due" | "baby" | "ready" | `q:${string}`;

export type OnboardingState = {
  /** Whether this device has said who it is. */
  known: boolean;
  /** Whether the household has finished onboarding. */
  onboarded: boolean;
  profile: Profile;
};

/** The question every household is asked first, and the answer that skips pregnancy's steps. */
export const EXPECTING = "expecting";
export const NOT_YET = "not-yet";

export function onboardingSteps({ known, onboarded, profile }: OnboardingState): Step[] {
  const steps: Step[] = known ? [] : ["who"];
  if (onboarded) return steps;
  steps.push("expecting");
  if (profile[EXPECTING] !== NOT_YET) steps.push("due", "baby");
  for (const q of PROFILE) if (q.asked === "onboarding" && q.id !== EXPECTING) steps.push(`q:${q.id}`);
  steps.push("ready");
  return steps;
}
