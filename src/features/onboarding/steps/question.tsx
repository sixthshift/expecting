import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { question } from "../../../content/profile";
import { saveAnswer } from "../../../server/functions/household";
import { AnswerInput } from "../../settings/ProfileForm";
import { Choices, SkipButton } from "../parts";
import type { Advance, Screen, StepContext } from "../step";

/** One of content/profile.yaml's onboarding questions, skippable. */
export function questionStep({ state, advance }: StepContext, id: string): Screen {
  const { household } = state;
  const q = question(id)!;
  const value = household.profile[q.id];
  const answers = Object.entries(q.answers).map(([value, label]) => ({ value, label }));
  return {
    title: q.ask,
    lead: "It tailors what Expecting shows you. Skip it and you'll see everything.",
    body: (
      <div className="flex flex-col gap-4">
        {answers.length <= 4 ? (
          <Choices options={answers} value={value} onChoose={(answer) => advance(() => saveAnswer({ data: { question: q.id, answer } }))} />
        ) : (
          <ChooseFromList question={q} value={value} onDone={advance} />
        )}
        <SkipButton onClick={() => advance()} />
      </div>
    ),
  };
}

function ChooseFromList({ question: q, value, onDone }: { question: NonNullable<ReturnType<typeof question>>; value?: string; onDone: Advance }) {
  const [answer, setAnswer] = useState(value);
  return (
    <div className="flex flex-col gap-4">
      <AnswerInput question={q} value={answer} onChange={setAnswer} />
      <Button
        intent="brand"
        size="xl"
        disabled={!answer}
        className="w-full"
        onClick={() => onDone(() => saveAnswer({ data: { question: q.id, answer: answer! } }))}
      >
        Next
      </Button>
    </div>
  );
}
