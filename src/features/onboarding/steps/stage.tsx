import { question } from "../../../content/profile";
import { STAGE } from "../../../lib/onboarding";
import { saveAnswer } from "../../../server/functions/household";
import { Choices } from "../parts";
import type { Screen, StepContext } from "../step";

/** Expecting yet, or getting ready: the household, once. */
export function stageStep({ state, advance }: StepContext): Screen {
  const { household } = state;
  const q = question(STAGE)!;
  return {
    title: q.ask,
    lead: "Either way, everything in Expecting is there to read.",
    body: (
      <Choices
        options={Object.entries(q.answers).map(([value, label]) => ({ value, label }))}
        value={household.profile[STAGE]}
        onChoose={(answer) => advance(() => saveAnswer({ data: { question: STAGE, answer } }))}
      />
    ),
  };
}
