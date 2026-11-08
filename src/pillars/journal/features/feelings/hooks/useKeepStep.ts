import { feelingsSaves } from "../../../../../api/rpc/feelings";
import { useSave } from "../../../../../app/hooks/useSave";
import { timeNow, todayISO } from "../../../../../lib/dates";
import type { OwnFeeling, Step } from "../../../../../lib/journal/feelings";
import { newId } from "../../../../../lib/outbox";
import { changeOf } from "../model/change";

/** Keep a step: a new check-in, now, or `feeling` changed to it, its words kept. Gives the check-in's id. */
export function useKeepStep(): (step: Step, feeling: OwnFeeling | undefined) => string {
  const add = useSave(feelingsSaves.addFeeling);
  const change = useSave(feelingsSaves.changeFeeling);
  return (step, feeling) => {
    if (feeling) {
      change(changeOf(feeling, { step }));
      return feeling.id;
    }
    const id = newId();
    add({ id, day: todayISO(), time: timeNow(), step, words: [], note: null });
    return id;
  };
}
