// How are you today? Asked on This week of whoever is holding the phone, once
// a day: one tap keeps it, words if you want them, then it folds away. No
// streaks and no reminders. The Journal keeps them all (FeelingsSection).

import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { feelingsSaves, useFeelingsQuery } from "../../../../api/rpc/feelings";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { useSave } from "../../../../app/hooks/useSave";
import { todayISO } from "../../../../lib/dates";
import { isOwn, latestOn, type OwnFeeling, STEP_LABEL, type Step } from "../../../../lib/feelings";
import { timeNow } from "../../../../lib/journal";
import { newId } from "../../../../lib/outbox";
import { MoreWords } from "../MoreWords";
import { StepPicker } from "../StepPicker";
import { Support, supportItem } from "../Support";

/** Keep a step: a new feeling, or today's one changed, its words kept. */
function useKeepStep() {
  const add = useSave(feelingsSaves.addFeeling);
  const change = useSave(feelingsSaves.changeFeeling);
  return (step: Step, feeling: OwnFeeling | undefined): string => {
    if (feeling) {
      change({ id: feeling.id, day: feeling.day, time: feeling.time, step, words: feeling.words, note: feeling.note });
      return feeling.id;
    }
    const id = newId();
    add({ id, day: todayISO(), time: timeNow(), step, words: [], note: null });
    return id;
  };
}

/** This week's check-in: the question, or today's answer folded, with a way to change it. */
export function CheckIn() {
  const { data: people } = usePeopleQuery();
  const { data: feelings } = useFeelingsQuery();
  const keepStep = useKeepStep();
  const change = useSave(feelingsSaves.changeFeeling);
  const [open, setOpen] = useState(false);
  const me = people.me;
  if (!me) return null;
  const today = latestOn(feelings.filter(isOwn), me.id, todayISO());

  function choose(step: Step) {
    keepStep(step, today);
    setOpen(true);
  }

  return (
    <section aria-labelledby="check-in" className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-normal p-4">
      {today && !open ? (
        <div className="flex animate-fade flex-wrap items-center justify-between gap-2">
          <h2 id="check-in" className="font-display font-semibold text-fg-strong">
            {STEP_LABEL[today.step]} today
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
            Change
          </Button>
        </div>
      ) : (
        <>
          <h2 id="check-in" className="font-display font-semibold text-fg-strong">
            How are you today, {me.name}?
          </h2>
          <StepPicker label="How are you today?" value={today?.step ?? null} onChoose={choose} />
          {today ? (
            <div className="animate-rise">
              <MoreWords
                key={today.id}
                feeling={today}
                onDone={(more) => {
                  change({ id: today.id, day: today.day, time: today.time, step: today.step, ...more });
                  setOpen(false);
                }}
              />
            </div>
          ) : null}
        </>
      )}
      {today?.step === "rough" ? <Support itemId={supportItem(me.role)} /> : null}
    </section>
  );
}
