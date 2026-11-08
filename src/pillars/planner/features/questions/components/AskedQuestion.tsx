import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { toast } from "@sixthshift/design-system/overlay";
import { useState } from "react";
import { useAppointmentsQuery } from "../../../../../api/rpc/appointments";
import { questionsSaves, useQuestionsQuery } from "../../../../../api/rpc/questions";
import { useSave } from "../../../../../app/hooks/useSave";
import { dayOf, todayISO } from "../../../../../lib/dates";
import { fullDate } from "../../../../../lib/labels";
import { newId } from "../../../../../lib/outbox";
import { appointmentName } from "../../../../../lib/planner/appointments";
import { type Question, waitingAt } from "../../../../../lib/planner/questions";
import { useAppointmentsAhead } from "../../../hooks/useAppointmentsAhead";
import { AppointmentChoice } from "./AppointmentChoice";
import { BookFirst } from "./BookFirst";
import { DeleteButton, Source } from "./parts";

/**
 * A question asked: what you were told, where (`where`: the appointment's
 * name, when it isn't already under it) and the way to ask it again, at an
 * appointment still ahead, keeping this one as the record of what was said.
 */
export function AskedQuestion({ question, where = false }: { question: Question; where?: boolean }) {
  const add = useSave(questionsSaves.addQuestion);
  const { data: questions } = useQuestionsQuery();
  const { data: appointments } = useAppointmentsQuery();
  const { ahead } = useAppointmentsAhead();
  const [choosing, setChoosing] = useState(false);
  const [booking, setBooking] = useState(false);
  const today = todayISO();
  const at = where ? appointments.find((a) => a.id === question.appointmentId) : undefined;
  const again = ahead.find((a) => waitingAt(questions, a.id, question.text));

  function askAt(appointmentId: string) {
    add({ id: newId(), text: question.text, itemId: question.itemId ?? undefined, appointmentId });
    setChoosing(false);
    const to = ahead.find((a) => a.id === appointmentId);
    toast({ title: to ? `Added for ${appointmentName(to, today)}` : "Added to your questions" });
  }

  function askAgain() {
    if (ahead.length === 0) setBooking(true);
    else if (ahead.length === 1) askAt(ahead[0]!.id);
    else setChoosing(true);
  }

  return (
    <Card size="sm">
      <div className="flex items-start gap-2">
        <p className="flex-1 font-medium whitespace-pre-wrap">{question.text}</p>
        <DeleteButton id={question.id} text={question.text} />
      </div>
      <Source question={question} />
      {question.answer ? <p className="mt-1 whitespace-pre-wrap text-fg-normal">{question.answer}</p> : null}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-fg-subtle">
        <span>Asked {at ? `at ${appointmentName(at, today)}` : fullDate(dayOf(question.askedAt!))}</span>
        {again ? (
          <span>Asking again, {appointmentName(again, today)}</span>
        ) : choosing ? (
          <div className="flex flex-wrap items-center gap-2">
            <AppointmentChoice ahead={ahead} value={undefined} onChange={askAt} label={`Ask "${question.text}" again at`} placeholder="Ask again at…" />
            <Button variant="ghost" size="sm" onClick={() => setChoosing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={askAgain}>
            Ask again
          </Button>
        )}
      </div>
      {booking ? <BookFirst question={question.text} onBooked={askAt} onClose={() => setBooking(false)} /> : null}
    </Card>
  );
}
