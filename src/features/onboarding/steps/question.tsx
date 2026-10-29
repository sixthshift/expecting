import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { saveAnswer } from "../../../api/rpc/facts";
import { DateForm } from "../../../components/DateForm";
import type { ISODate } from "../../../lib/dates";
import { latestByKey } from "../../../lib/facts";
import { AnswerInput, askedOfIn } from "../../settings/components/facts/FactsForm";
import { type Ask, ask } from "../../settings/model/facts";
import { Choices, SkipButton } from "../parts";
import type { Advance, Screen, StepContext } from "../step";

/**
 * One of src/features/settings/model/facts.data.ts's onboarding questions, skippable. A skip is kept,
 * unless it's already answered, so This week asks it again only once its week
 * has come, not straight away.
 */
export function questionStep({ state, advance }: StepContext, key: string): Screen {
  const a = ask(key)!;
  const last = latestByKey(state.answers)[key];
  const value = last?.value ?? undefined;
  const save = (answer: string | null) => () => saveAnswer({ data: { key, answer } });
  const answers = Object.entries(a.question.answers).map(([value, label]) => ({ value, label }));
  return {
    title: askedOfIn(a, state.people),
    lead: "It tailors what Expecting shows you. Skip it and you'll see everything, and be asked again when it matters.",
    body: (
      <div className="flex flex-col gap-4">
        {a.question.type === "date" ? (
          <DateForm
            label="Date"
            value={(value as ISODate | undefined) ?? null}
            submitLabel="Next"
            wide
            requireChange={false}
            onSave={(date) => advance(save(date))}
          />
        ) : answers.length <= 4 ? (
          <Choices options={answers} value={value} onChoose={(answer) => advance(save(answer))} />
        ) : (
          <ChooseFromList ask={a} name={askedOfIn(a, state.people)} value={value} onDone={advance} />
        )}
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
