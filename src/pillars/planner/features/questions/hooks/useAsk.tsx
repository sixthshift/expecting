import { type ReactNode, useState } from "react";
import { questionsSaves } from "../../../../../api/rpc/questions";
import { useSave } from "../../../../../app/hooks/useSave";
import { newId } from "../../../../../lib/outbox";
import { useAppointmentsAhead } from "../../../hooks/useAppointmentsAhead";
import { BookFirst } from "../components/BookFirst";

/**
 * A question added in one tap, from the Library or the Journal: it goes to
 * the next appointment; with none booked, `sheet` asks
 * for it first, and the question goes to it once it's added. Draw `sheet`.
 */
export function useAsk(): { ask: (text: string, itemId?: string) => void; sheet: ReactNode } {
  const { next } = useAppointmentsAhead();
  const add = useSave(questionsSaves.addQuestion);
  const [waiting, setWaiting] = useState<{ text: string; itemId?: string } | null>(null);

  function ask(text: string, itemId?: string) {
    if (next) add({ id: newId(), text, itemId, appointmentId: next.id });
    else setWaiting({ text, itemId });
  }

  const sheet = waiting ? (
    <BookFirst
      question={waiting.text}
      onBooked={(appointmentId) => add({ id: newId(), text: waiting.text, itemId: waiting.itemId, appointmentId })}
      onClose={() => setWaiting(null)}
    />
  ) : null;
  return { ask, sheet };
}
