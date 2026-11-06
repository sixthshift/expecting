import { Button } from "@sixthshift/design-system/button";
import { Textarea } from "@sixthshift/design-system/textarea";
import { type FormEvent, useState } from "react";
import { questionsSaves } from "../../../../../api/rpc/questions";
import { useSave } from "../../../../../app/hooks/useSave";
import { todayISO } from "../../../../../lib/dates";
import { newId } from "../../../../../lib/outbox";
import { appointmentName } from "../../../../../lib/planner/appointments";
import { useAppointmentsAhead } from "../../../hooks/useAppointmentsAhead";
import { AppointmentChoice } from "./AppointmentChoice";
import { NoneBooked } from "./NoneBooked";

/**
 * A question, for an appointment: the next one unless another still ahead is
 * chosen, or `at` alone (under that appointment, nothing to choose). With none
 * booked, the next one is added first. `text`: its words to start (shared from
 * another app). `onAdded` once it's on the list (the capture sheet closes).
 */
export function AddQuestion({ text: start, at, onAdded }: { text?: string; at?: string; onAdded?: () => void }) {
  const { next, later } = useAppointmentsAhead();
  const [text, setText] = useState(start?.slice(0, 1000) ?? "");
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const add = useSave(questionsSaves.addQuestion);
  const ahead = next ? [next, ...later] : [];
  // The one chosen while it's still ahead; else the next.
  const appointmentId = at ?? (ahead.some((a) => a.id === chosen) ? chosen : next?.id);

  if (!appointmentId) return <NoneBooked />;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (text.trim().length === 0 || !appointmentId) return;
    add({ id: newId(), text, appointmentId });
    setText("");
    onAdded?.();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What do you want to ask?"
        aria-label="New question"
        autosize
        rows={2}
        maxLength={1000}
      />
      <div className="flex flex-wrap items-center gap-2">
        {at ? null : ahead.length > 1 ? (
          <AppointmentChoice ahead={ahead} value={appointmentId} onChange={setChosen} />
        ) : (
          <span className="text-sm text-fg-subtle">For {appointmentName(ahead[0]!, todayISO())}</span>
        )}
        <Button type="submit" intent="brand" disabled={text.trim().length === 0}>
          Add question
        </Button>
      </div>
    </form>
  );
}
