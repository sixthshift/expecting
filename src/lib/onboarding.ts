// The first-run questions, as steps. Pure: which steps a device sees follows
// from what is already known, so a reload resumes where it left off and the
// second parent's phone asks only who they are.
//
//   who        which person is holding this phone (every new device)
//   due        the due date (the household, once)
//   baby       boy, girl or don't know: the colours
//   q:<key>    content/facts.yaml's `asked: onboarding` questions, once for
//              each of you where they're about each, and only where their
//              `when` fits the answers so far
//   ready      where Expecting will open, and in

import { ASKS, type Facts } from "../content/facts";
import { isAsked } from "./facts";

export type Step = "who" | "due" | "baby" | "ready" | `q:${string}`;

export type OnboardingState = {
  /** Whether this device has said who it is. */
  known: boolean;
  /** Whether the household has finished onboarding. */
  onboarded: boolean;
  /** What has been said so far: a question depending on another is asked only when its answer fits. */
  facts?: Facts;
};

export function onboardingSteps({ known, onboarded, facts = {} }: OnboardingState): Step[] {
  const steps: Step[] = known ? [] : ["who"];
  if (onboarded) return steps;
  steps.push("due", "baby");
  for (const a of ASKS) if (a.question.asked === "onboarding" && isAsked(a, facts)) steps.push(`q:${a.key}`);
  steps.push("ready");
  return steps;
}

/** Every step there could be, in the order they're asked. */
const ALL_STEPS = onboardingSteps({ known: false, onboarded: false });

/**
 * The step to ask after `after`: the first of `steps` (what's left to ask,
 * worked out afresh) that comes later in the order: the other phone may have
 * finished onboarding meanwhile. Undefined when there's nothing after it.
 */
export function stepAfter(steps: readonly Step[], after: Step): Step | undefined {
  const order = (s: Step) => ALL_STEPS.indexOf(s);
  return steps.find((s) => order(s) > order(after));
}
