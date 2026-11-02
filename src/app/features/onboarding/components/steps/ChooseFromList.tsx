import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { saveAnswer } from "../../../../../api/rpc/facts";
import { AnswerInput } from "../../../settings/components/answer/AnswerInput";
import type { Ask } from "../../../settings/model/facts";
import { useOnboardingPage } from "../../contexts/OnboardingPageContext";

/** A long list of answers (a state): chosen, then Next. */
export function ChooseFromList({ ask: a, name, value }: { ask: Ask; name: string; value?: string }) {
  const { advance } = useOnboardingPage();
  const [answer, setAnswer] = useState(value);
  return (
    <div className="flex flex-col gap-4">
      <AnswerInput question={a.question} label={name} value={answer} onChange={setAnswer} />
      <Button
        intent="brand"
        size="xl"
        disabled={!answer}
        className="w-full"
        onClick={() => advance(() => saveAnswer({ data: { key: a.key, answer: answer! } }))}
      >
        Next
      </Button>
    </div>
  );
}
