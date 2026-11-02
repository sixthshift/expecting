import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { saveAnswer } from "../../../../api/rpc/facts";
import { latestByKey } from "../../../../lib/facts";
import { AnswerField } from "../../../settings/components/answer/AnswerField";
import { AnswerInput } from "../../../settings/components/answer/AnswerInput";
import { type Ask, ask, askedOf } from "../../../settings/model/facts";
import type { Advance, Screen, StepContext } from "../../model/step";
import { Choices } from "../Choices";
import { SkipButton } from "../SkipButton";

/**
 * One of src/features/settings/model/facts.data.ts's onboarding questions, skippable. A skip is kept,
 * unless it's already answered, so This week asks it again only once its week
 * has come, not straight away.
 */
export function questionStep({ answers, people, advance }: StepContext, key: string): Screen {
  const a = ask(key)!;
  const last = latestByKey(answers)[key];
  const value = last?.value ?? undefined;
  const save = (answer: string | null) => () => saveAnswer({ data: { key, answer } });
  const options = Object.entries(a.question.answers).map(([value, label]) => ({ value, label }));
  return {
    title: askedOf(a, people),
    lead: "It tailors what Expecting shows you. Skip it and you'll see everything, and be asked again when it matters.",
    body: (
      <div className="flex flex-col gap-4">
        <AnswerField
          question={a.question}
          label={askedOf(a, people)}
          value={value}
          submitLabel="Next"
          wide
          requireChange={false}
          onAnswer={(answer) => advance(save(answer))}
          choice={
            options.length <= 4 ? (
              <Choices options={options} value={value} onChoose={(answer) => advance(save(answer))} />
            ) : (
              <ChooseFromList ask={a} name={askedOf(a, people)} value={value} onDone={advance} />
            )
          }
        />
        <SkipButton onClick={() => advance(last ? undefined : save(null))} />
      </div>
    ),
  };
}

function ChooseFromList({ ask: a, name, value, onDone }: { ask: Ask; name: string; value?: string; onDone: Advance }) {
  const [answer, setAnswer] = useState(value);
  return (
    <div className="flex flex-col gap-4">
      <AnswerInput question={a.question} label={name} value={answer} onChange={setAnswer} />
      <Button
        intent="brand"
        size="xl"
        disabled={!answer}
        className="w-full"
        onClick={() => onDone(() => saveAnswer({ data: { key: a.key, answer: answer! } }))}
      >
        Next
      </Button>
    </div>
  );
}
