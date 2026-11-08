import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { toast } from "@sixthshift/design-system/overlay";
import { Textarea } from "@sixthshift/design-system/textarea";
import { type FormEvent, useState } from "react";
import { questionsSaves } from "../../../../../api/rpc/questions";
import { useSave } from "../../../../../app/hooks/useSave";
import { todayISO } from "../../../../../lib/dates";
import { appointmentName } from "../../../../../lib/planner/appointments";
import type { Question } from "../../../../../lib/planner/questions";
import { useAppointmentsAhead } from "../../../hooks/useAppointmentsAhead";
import { AppointmentChoice } from "./AppointmentChoice";
import { DeleteButton, Source } from "./parts";

/**
 * A question still to ask, in the Planner: its words, where it came from and
 * whose, the way to say it was asked, with what you were told, and the way to
 * move it to another appointment still ahead. `asked`: false where it can't
 * have been (its appointment deleted), so moving it is all there is.
 */
export function OpenQuestion({ question, asked = true }: { question: Question; asked?: boolean }) {
  const [doing, setDoing] = useState<"answering" | "moving" | null>(null);
  const [answer, setAnswer] = useState(question.answer ?? "");
  const markAsked = useSave(questionsSaves.markAsked);
  const reopen = useSave(questionsSaves.reopenQuestion);
  const move = useSave(questionsSaves.moveQuestion);
  const elsewhere = useAppointmentsAhead().ahead.filter((a) => a.id !== question.appointmentId);

  function save(event: FormEvent) {
    event.preventDefault();
    markAsked({ id: question.id, answer });
    toast({ title: "Marked asked", action: "Undo", onAction: () => reopen({ id: question.id }) });
  }

  function moveTo(appointmentId: string) {
    const to = elsewhere.find((a) => a.id === appointmentId);
    if (!to) return;
    move({ id: question.id, appointmentId });
    setDoing(null);
    toast({ title: `Moved to ${appointmentName(to, todayISO())}` });
  }

  return (
    <Card size="sm">
      <div className="flex items-start gap-2">
        <p className="flex-1 whitespace-pre-wrap">{question.text}</p>
        <DeleteButton id={question.id} text={question.text} />
      </div>
      <Source question={question} />
      {doing === "answering" ? (
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
            <Button type="button" variant="ghost" size="sm" onClick={() => setDoing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : doing === "moving" ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <AppointmentChoice ahead={elsewhere} value={undefined} onChange={moveTo} label={`Move "${question.text}" to`} placeholder="Move to…" />
          <Button type="button" variant="ghost" size="sm" onClick={() => setDoing(null)}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {asked ? (
            <Button variant="outline" size="sm" onClick={() => setDoing("answering")}>
              Asked it
            </Button>
          ) : null}
          {elsewhere.length > 0 ? (
            <Button variant={asked ? "ghost" : "outline"} size="sm" onClick={() => setDoing("moving")}>
              Move to another
            </Button>
          ) : null}
        </div>
      )}
    </Card>
  );
}
