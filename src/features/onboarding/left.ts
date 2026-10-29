import type { Answer } from "../../lib/facts";
import { factsOf } from "../../lib/facts";
import { onboardingSteps } from "../../lib/onboarding";
import type { Person } from "../../lib/people";

/** The first-run questions this phone, or this household, still has to answer. None once it's set up. */
export function onboardingLeft({ me, onboardedAt, answers }: { me: Person | null; onboardedAt: string | null; answers: readonly Answer[] }) {
  return onboardingSteps({ known: me !== null, onboarded: onboardedAt !== null, facts: factsOf(answers) });
}
