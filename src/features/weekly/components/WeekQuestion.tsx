import { Button } from "@sixthshift/design-system/button";
import { Textarea } from "@sixthshift/design-system/textarea";
import { useState } from "react";
import { weeklySaves } from "../../../api/rpc/weekly";
import { useSave } from "../../../app/hooks/useSave";
import { questionOf, type WeeklyWeek } from "../../../lib/weekly";

/**
 * A week's question as this phone has it: still to answer, answered and
 * waiting for the other, or both answered, side by side. Your answer can be
 * changed at any time.
 */
export function WeekQuestion({ week, other, heading }: { week: WeeklyWeek; other: string; heading?: string }) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(week.mine?.body ?? "");
  const answer = useSave(weeklySaves.answerWeekly);
  const question = questionOf(week.week)!;

  function keep() {
    answer({ week: week.week, body });
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-2">
      {heading ? <p className="text-xs font-semibold tracking-wide text-fg-normal uppercase">{heading}</p> : null}
      <p className="font-display text-lg font-semibold text-fg-strong">{question}</p>
      {!week.mine || editing ? (
        <>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} aria-label={`Your answer: ${question}`} rows={3} maxLength={4000} />
          <div className="flex flex-wrap items-center gap-2">
            <Button intent="brand" size="sm" disabled={body.trim().length === 0} onClick={keep}>
              Keep my answer
            </Button>
            {editing ? (
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            ) : (
              <span className="text-xs text-fg-subtle">{other} sees it once they've answered too.</span>
            )}
          </div>
        </>
      ) : (
        <>
          <Said body={week.mine.body} who="You" />
          {week.theirs ? <Said body={week.theirs.body} who={other} /> : <p className="text-sm text-fg-subtle">Waiting for {other}.</p>}
          <Button variant="ghost" size="sm" className="w-fit" onClick={() => setEditing(true)}>
            Change my answer
          </Button>
        </>
      )}
    </div>
  );
}

function Said({ body, who }: { body: string; who: string }) {
  return (
    <p className="border-l-2 border-border-brand pl-3 whitespace-pre-line text-fg-normal">
      {body}
      <span className="text-sm text-fg-subtle"> — {who}</span>
    </p>
  );
}
