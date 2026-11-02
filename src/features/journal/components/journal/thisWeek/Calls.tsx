import { useAppetiteQuery } from "../../../../../api/rpc/appetite";
import { useJournalQuery } from "../../../../../api/rpc/journal";
import { todayISO } from "../../../../../lib/dates";
import { callsToMake } from "../../../../../lib/journalNow";
import { TooSick } from "../../entries/appetite/TooSick";
import { MovementsChanged } from "../../entries/movements/MovementsChanged";

/** The calls to make, if any: a movement felt as different lately, or can't keep fluids down today. On the Journal only: the quiet Journal has none. */
export function Calls() {
  const { data: journal } = useJournalQuery();
  const { data: appetite } = useAppetiteQuery();
  const calls = callsToMake(journal, appetite, todayISO());
  if (!calls.moved && !calls.fluids) return null;
  return (
    <div className="flex flex-col gap-3">
      {calls.moved ? <MovementsChanged /> : null}
      {calls.fluids ? <TooSick /> : null}
    </div>
  );
}
