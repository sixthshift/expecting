import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { usePeopleQuery } from "../../../api/rpc/people";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { useNow } from "../../../api/rpc/settings";
import { useWeeklyQuery } from "../../../api/rpc/weekly";
import { extrasOn } from "../../../lib/extras";
import { weekLabel } from "../../../lib/timeline";
import { earlier, questionOf, weekOf } from "../../../lib/weekly";
import { WeekQuestion } from "./WeekQuestion";

/**
 * This week's question, on This week, while A question a week is on: answered
 * on this phone, and the other's answer once both have given one. Below it,
 * folded, the earlier weeks' questions, still there to answer: never counted,
 * never chased. Nothing while something has happened, or before a phone has
 * said who's holding it.
 */
export function WeeklyCard() {
  const { data: on } = useExtrasQuery({ select: (e) => extrasOn(e).has("question-a-week") });
  const { data: quiet } = useQuietQuery();
  const { data: view } = useWeeklyQuery();
  const { me, people } = usePeopleQuery().data;
  const now = useNow();
  const [showEarlier, setShowEarlier] = useState(false);
  if (!on || quiet || now === null || !me) return null;
  const other = people.find((p) => p.id !== me.id)?.name ?? "The other one";
  const before = earlier(now);
  const asked = questionOf(now) !== undefined;
  if (!asked && before.length === 0) return null;

  return (
    <section aria-labelledby="weekly" className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-normal p-4">
      <h2 id="weekly" className="text-sm font-semibold text-fg-normal">
        This week's question
      </h2>
      {asked ? <WeekQuestion week={weekOf(view, now)} other={other} /> : <p className="text-sm text-fg-subtle">No question this week.</p>}
      {before.length > 0 ? (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            aria-expanded={showEarlier}
            onClick={() => setShowEarlier((s) => !s)}
            className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal"
          >
            {showEarlier ? <ChevronDown aria-hidden size={16} /> : <ChevronRight aria-hidden size={16} />}
            Earlier weeks' questions
          </button>
          {showEarlier ? before.map((week) => <WeekQuestion key={week} week={weekOf(view, week)} other={other} heading={weekLabel(week)} />) : null}
        </div>
      ) : null}
    </section>
  );
}
