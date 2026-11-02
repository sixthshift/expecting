import { useQuery } from "@tanstack/react-query";
import { answersQuery } from "../../../api/rpc/facts";
import { itsTimeQuery } from "../../../api/rpc/itsTime";
import { quietQuery } from "../../../api/rpc/quiet";
import { settingsQuery } from "../../../api/rpc/settings";
import { todayISO } from "../../../lib/dates";
import { factsOf } from "../../../lib/facts";
import { itsTimeShown, openStart } from "../../../lib/itsTime";
import { positionOn } from "../../../lib/timeline";

/** Whether the way in is drawn: from week 36 (32 for twins or more), or while a start is under way; never while something has happened. Read without suspense: the frame never waits for it. */
export function useItsTimeShown(): { shown: boolean; underWay: boolean } {
  const { data: itsTime } = useQuery(itsTimeQuery);
  const { data: quiet } = useQuery(quietQuery);
  const { data: answers } = useQuery(answersQuery);
  const { data: settings } = useQuery(settingsQuery);
  const underWay = Boolean(itsTime && openStart(itsTime));
  const now = settings?.dueDate ? positionOn(todayISO(), settings.dueDate).week : null;
  const shown = itsTimeShown({ now, facts: answers ? factsOf(answers) : {}, quiet: Boolean(quiet), open: underWay });
  return { shown, underWay };
}
