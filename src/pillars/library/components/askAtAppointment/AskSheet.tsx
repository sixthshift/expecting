import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Modal } from "@sixthshift/design-system/modal";
import { toast } from "@sixthshift/design-system/overlay";
import { Textarea } from "@sixthshift/design-system/textarea";
import { Check } from "lucide-react";
import { type FormEvent, useState } from "react";
import { questionsSaves } from "../../../../api/rpc/questions";
import { useSave } from "../../../../app/hooks/useSave";
import { todayISO } from "../../../../lib/dates";
import { newId } from "../../../../lib/outbox";
import { appointmentName } from "../../../../lib/planner/appointments";
import { AppointmentChoice } from "../../../planner/features/questions/components/AppointmentChoice";
import { NoneBooked } from "../../../planner/features/questions/components/NoneBooked";
import { useAppointmentsAhead } from "../../../planner/hooks/useAppointmentsAhead";
import { useEntry } from "../../contexts/LibraryItemPageContext";
import { suggestionsFor } from "../../model/suggestions";
import { useContentContext } from "../content/context";

/** The sheet: the questions the entry suggests, a box for your own words, and the appointment it's for (the next, unless another is chosen; with none booked, it's added first). */
export function AskSheet({ onClose }: { onClose: () => void }) {
  const { item, page } = useEntry();
  const suggestions = suggestionsFor(item, page);
  const { openQuestions } = useContentContext();
  const [text, setText] = useState("");
  const add = useSave(questionsSaves.addQuestion);
  const onList = text.trim().length > 0 && openQuestions.includes(text.trim());
  const { next, later } = useAppointmentsAhead();
  const ahead = next ? [next, ...later] : [];
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const forIt = ahead.find((a) => a.id === chosen) ?? next;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (text.trim().length === 0 || onList || !forIt) return;
    add({ id: newId(), text, itemId: item.id, appointmentId: forIt.id });
    toast({ title: `Added for ${appointmentName(forIt, todayISO())}` });
    onClose();
  }

  return (
    <Modal size="sm" align="top" closable onOpenChange={(o) => (o ? null : onClose())} aria-label="Ask at your next appointment">
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">Ask at your next appointment</h2>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4 px-6 pb-6">
        <form onSubmit={submit} className="flex flex-col gap-4">
          {suggestions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-fg-subtle">Suggested</p>
              <ul className="flex flex-col gap-2">
                {suggestions.map((s) => (
                  <li key={s}>
                    {openQuestions.includes(s) ? (
                      <Card size="sm" className="flex min-h-11 items-center gap-3 text-sm leading-snug text-fg-subtle">
                        <span className="flex-1">{s}</span>
                        <span className="flex shrink-0 items-center gap-1 text-xs">
                          <Check aria-hidden size={14} /> On your list
                        </span>
                      </Card>
                    ) : (
                      // Taken into the box, to send as it is or change first.
                      <Card
                        size="sm"
                        onClick={() => setText(s)}
                        aria-pressed={text === s}
                        className="flex min-h-11 items-center text-sm leading-snug text-fg-normal aria-pressed:border-border-brand"
                      >
                        {s}
                      </Card>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={suggestions.length > 0 ? "Or in your own words…" : "What do you want to ask?"}
            aria-label="Your question"
            autosize
            rows={2}
            maxLength={1000}
          />
          {onList ? <p className="text-xs text-fg-subtle">That one's already on your list.</p> : null}
          {forIt === null ? null : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              {ahead.length > 1 ? (
                <AppointmentChoice ahead={ahead} value={forIt.id} onChange={setChosen} />
              ) : (
                <span className="text-sm text-fg-subtle">For {appointmentName(forIt, todayISO())}</span>
              )}
              <Button type="submit" intent="brand" disabled={text.trim().length === 0 || onList} className="ml-auto">
                Add to my questions
              </Button>
            </div>
          )}
        </form>
        {forIt === null ? <NoneBooked /> : null}
      </Modal.Body>
    </Modal>
  );
}
