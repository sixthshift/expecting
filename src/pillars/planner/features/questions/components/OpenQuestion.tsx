import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Textarea } from "@sixthshift/design-system/textarea";
import { type FormEvent, useState } from "react";
import { questionsSaves } from "../../../../../api/rpc/questions";
import { useSave } from "../../../../../app/hooks/useSave";
import type { Question } from "../../../../../lib/planner/questions";
import { DeleteButton, Source } from "./parts";

/** A question still to ask, in the Planner: its words, where it came from and whose, and the way to say it was asked, with what you were told. */
export function OpenQuestion({ question }: { question: Question }) {
  const [answering, setAnswering] = useState(false);
  const [answer, setAnswer] = useState(question.answer ?? "");
  const markAsked = useSave(questionsSaves.markAsked);

  function save(event: FormEvent) {
    event.preventDefault();
    markAsked({ id: question.id, answer });
  }

  return (
    <Card size="sm">
      <div className="flex items-start gap-2">
        <p className="flex-1 whitespace-pre-wrap">{question.text}</p>
        <DeleteButton id={question.id} text={question.text} />
      </div>
      <Source question={question} />
      {answering ? (
        <form onSubmit={save} className="mt-2 flex flex-col gap-2">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="What did they say? (optional)"
            aria-label="Answer"
            autosize
            rows={2}
          />
          <div className="flex gap-2">
            <Button type="submit" intent="brand" size="sm">
              Save as asked
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAnswering(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" className="mt-2" onClick={() => setAnswering(true)}>
          Asked it
        </Button>
      )}
    </Card>
  );
}
