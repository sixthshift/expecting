// A check-in at any time, not only today's: the Journal's, and the capture
// sheet's. A tap keeps a new feeling; its words are offered until done, and
// Rough adds someone to talk to. For whoever is holding the phone.

import { useState } from "react";
import { feelingsSaves, useFeelingsQuery } from "../../../../../../api/rpc/feelings";
import { useQuietKind } from "../../../../../../app/features/quiet/hooks/useQuietKind";
import { useSave } from "../../../../../../app/hooks/useSave";
import { feelingsOf, isOwn, type Step } from "../../../../../../lib/journal/feelings";
import type { Person } from "../../../../../../lib/people";
import { useKeepStep } from "../../hooks/useKeepStep";
import { changeOf } from "../../model/change";
import { MoreWords } from "../MoreWords";
import { StepPicker } from "../StepPicker";
import { Support, supportItem } from "../Support";

/** `onKept` as a new feeling is kept; `onDone`, with its id, once its words are. */
export function CheckInNow({ me, onKept, onDone }: { me: Person; onKept?: () => void; onDone?: (id: string) => void }) {
  const { data: feelings } = useFeelingsQuery();
  const quiet = useQuietKind();
  const keepStep = useKeepStep();
  const change = useSave(feelingsSaves.changeFeeling);
  // The check-in just made here, open for its words until done.
  const [justMade, setJustMade] = useState<string | null>(null);
  const mine = feelingsOf(feelings.filter(isOwn), me.id);
  const made = mine.find((f) => f.id === justMade);

  function checkIn(step: Step) {
    const id = keepStep(step, made);
    if (made) return;
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
            change(changeOf(made, more));
            setJustMade(null);
            onDone?.(made.id);
          }}
        />
      ) : null}
      {made?.step === "rough" ? <Support itemId={supportItem(me.role, Boolean(quiet))} /> : null}
    </div>
  );
}
