import type { Answer } from "../../../lib/facts";
import { factsOf } from "../../../lib/facts";
import { onboardingSteps } from "../../../lib/onboarding";

/** The first-run questions the two of you still have to answer. None once it's set up. */
export function onboardingLeft({ onboardedAt, answers }: { onboardedAt: string | null; answers: readonly Answer[] }) {
  return onboardingSteps({ onboarded: onboardedAt !== null, facts: factsOf(answers) });
}
