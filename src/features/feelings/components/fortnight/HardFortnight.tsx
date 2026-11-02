// After a hard couple of weeks, a quiet suggestion to talk to someone, shown
// only to the person it's about (hardFortnight in src/lib/feelings.ts). It
// never names a condition. Dismissed, it stays away for a fortnight, on this
// phone.

import { Button } from "@sixthshift/design-system/button";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useFeelingsQuery } from "../../../../api/rpc/feelings";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { addDays, type ISODate, todayISO } from "../../../../lib/dates";
import { FORTNIGHT, feelingsOf, hardFortnight, isOwn } from "../../../../lib/feelings";
import { Support, supportItem } from "../Support";

/** Where the phone remembers the day the card was last put away. */
export const FORTNIGHT_DISMISSED_KEY = "expecting-fortnight-dismissed";

function dismissedOn(): ISODate | null {
  try {
    return localStorage.getItem(FORTNIGHT_DISMISSED_KEY) as ISODate | null;
  } catch {
    return null;
  }
}

export function HardFortnight() {
  const { data: people } = usePeopleQuery();
  const { data: feelings } = useFeelingsQuery();
  const [dismissed, setDismissed] = useState(dismissedOn);
  const me = people.me;
  const today = todayISO();
  if (!me) return null;
  if (dismissed && today < addDays(dismissed, FORTNIGHT.days)) return null;
  if (!hardFortnight(feelingsOf(feelings.filter(isOwn), me.id), today)) return null;

  function dismiss() {
    try {
      localStorage.setItem(FORTNIGHT_DISMISSED_KEY, today);
    } catch {
      // Not kept: it may show again next time, which is the lesser harm.
    }
    setDismissed(today);
  }

  return (
    <section
      aria-labelledby="hard-fortnight"
      className="flex flex-col gap-3 rounded-xl bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-4"
    >
      <div className="flex items-start gap-3">
        <Heart aria-hidden size={18} className="mt-0.5 shrink-0 text-fg-brand" />
        <div className="flex flex-col gap-1">
          <h2 id="hard-fortnight" className="font-display font-semibold text-fg-strong">
            It's been a hard couple of weeks
          </h2>
          <p className="text-sm text-fg-normal">Low or anxious feelings that last more than two weeks are worth talking about with your GP or midwife.</p>
        </div>
      </div>
      <Support itemId={supportItem(me.role)} />
      <Button variant="ghost" size="sm" className="self-start" onClick={dismiss}>
        Not now
      </Button>
    </section>
  );
}
