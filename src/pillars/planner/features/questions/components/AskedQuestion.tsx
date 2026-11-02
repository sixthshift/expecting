import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { questionsSaves } from "../../../../../api/rpc/questions";
import { useSave } from "../../../../../app/hooks/useSave";
import { todayISO } from "../../../../../lib/dates";
import { fullDate } from "../../../../../lib/labels";
import type { Question } from "../../../../../lib/planner/questions";
import { DeleteButton, Source } from "./parts";

/** A question asked, in the week it was asked: what you were told, and the way to ask it again. */
export function AskedQuestion({ question }: { question: Question }) {
  const reopen = useSave(questionsSaves.reopenQuestion);
  return (
    <Card size="sm">
      <div className="flex items-start gap-2">
        <p className="flex-1 font-medium whitespace-pre-wrap">{question.text}</p>
        <DeleteButton id={question.id} text={question.text} />
      </div>
      <Source question={question} />
      {question.answer ? <p className="mt-1 whitespace-pre-wrap text-fg-normal">{question.answer}</p> : null}
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-fg-subtle">
        <span>Asked {fullDate(todayISO(new Date(question.askedAt!)))}</span>
        <Button variant="ghost" size="sm" onClick={() => reopen({ id: question.id })}>
          Ask again
        </Button>
      </div>
    </Card>
  );
}
