import { question } from "../../../content/profile";
import { EXPECTING } from "../../../lib/onboarding";
import { saveAnswer } from "../../../rpc/household";
import { Choices } from "../parts";
import type { Screen, StepContext } from "../step";

/** Expecting yet, or getting ready: the household, once. */
export function expectingStep({ state, advance }: StepContext): Screen {
  const { household } = state;
  const q = question(EXPECTING)!;
  return {
    title: q.ask,
    lead: "Either way, everything in Expecting is there to read.",
    body: (
      <Choices
        options={Object.entries(q.answers).map(([value, label]) => ({ value, label }))}
        value={household.profile[EXPECTING]}
        onChoose={(answer) => advance(() => saveAnswer({ data: { question: EXPECTING, answer } }))}
      />
    ),
  };
}
