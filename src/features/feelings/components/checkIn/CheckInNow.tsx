// A check-in at any time, not only today's: the Journal's, and the capture
// sheet's. A tap keeps a new feeling; its words are offered until done, and
// Rough adds someone to talk to. For whoever is holding the phone.

import { useState } from "react";
import { feelingsSaves, useFeelingsQuery } from "../../../../api/rpc/feelings";
import { useQuietQuery } from "../../../../api/rpc/quiet";
import { useSave } from "../../../../app/hooks/useSave";
import { todayISO } from "../../../../lib/dates";
import { feelingsOf, isOwn, type Step } from "../../../../lib/feelings";
import { timeNow } from "../../../../lib/journal";
import { newId } from "../../../../lib/outbox";
import type { Person } from "../../../../lib/people";
import { MoreWords } from "../MoreWords";
import { StepPicker } from "../StepPicker";
import { Support, supportItem } from "../Support";

/** `onKept` as a new feeling is kept; `onDone`, with its id, once its words are. */
export function CheckInNow({ me, onKept, onDone }: { me: Person; onKept?: () => void; onDone?: (id: string) => void }) {
  const { data: feelings } = useFeelingsQuery();
  const { data: quiet } = useQuietQuery();
  const add = useSave(feelingsSaves.addFeeling);
  const change = useSave(feelingsSaves.changeFeeling);
  // The check-in just made here, open for its words until done.
  const [justMade, setJustMade] = useState<string | null>(null);
  const mine = feelingsOf(feelings.filter(isOwn), me.id);
  const made = mine.find((f) => f.id === justMade);

  function checkIn(step: Step) {
    if (made) {
      change({ id: made.id, day: made.day, time: made.time, step, words: made.words, note: made.note });
      return;
    }
    const id = newId();
    add({ id, day: todayISO(), time: timeNow(), step, words: [], note: null });
    setJustMade(id);
    onKept?.();
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-fg-normal">{mine.length > 0 ? "Check in again, as often as you like." : "How are you right now?"}</p>
      <StepPicker label="How are you right now?" value={made?.step ?? null} onChoose={checkIn} />
      {made ? (
        <MoreWords
          key={made.id}
          feeling={made}
          onDone={(more) => {
            change({ id: made.id, day: made.day, time: made.time, step: made.step, ...more });
            setJustMade(null);
            onDone?.(made.id);
          }}
        />
      ) : null}
      {made?.step === "rough" ? <Support itemId={supportItem(me.role, Boolean(quiet))} /> : null}
    </div>
  );
}
