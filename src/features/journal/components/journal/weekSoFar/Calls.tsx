import { useAppetite } from "../../../../../api/rpc/appetite";
import { useJournal } from "../../../../../api/rpc/journal";
import { useQuiet } from "../../../../../api/rpc/quiet";
import { todayISO } from "../../../../../lib/dates";
import { callsToMake } from "../../../../../lib/journalNow";
import { TooSick } from "../../entries/appetite/TooSick";
import { MovementsChanged } from "../../entries/movements/MovementsChanged";

/** The calls to make, if any: a movement felt as different lately, or can't keep fluids down today. Never while something has happened. */
export function Calls() {
  const { data: journal } = useJournal();
  const { data: appetite } = useAppetite();
  const { data: quiet } = useQuiet();
  const calls = callsToMake(journal, appetite, todayISO());
  if (quiet || (!calls.moved && !calls.fluids)) return null;
  return (
    <div className="flex flex-col gap-3">
      {calls.moved ? <MovementsChanged /> : null}
      {calls.fluids ? <TooSick /> : null}
    </div>
  );
}
