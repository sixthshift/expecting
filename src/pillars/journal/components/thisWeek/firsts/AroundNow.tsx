// Above the story, what's to keep now: around now, the firsts whose weeks
// take this one in, each an invitation with its question, answered in your
// own words. Where you are in the pregnancy is This week's, not the
// Journal's: this week is the story's first week, as any.

import type { FirstDef } from "../../../../../lib/journal/firsts";
import type { Week } from "../../../../../lib/timeline";
import { useOnThisPhone } from "../../../hooks/useOnThisPhone";
import { AroundNowFirst } from "./AroundNowFirst";

/** The firsts that usually come around now, each to write or put off for the week; nothing once each is kept or put off. */
export function AroundNow({ week, around }: { week: Week; around: readonly FirstDef[] }) {
  const [notYet, putOff] = useOnThisPhone("expecting:first-not-yet");
  const shown = around.filter((f) => !notYet.includes(`${f.key}@${week}`));
  if (shown.length === 0) return null;
  return (
    <section aria-labelledby="around-now" className="flex flex-col gap-3">
      <h2 id="around-now" className="text-sm font-semibold text-fg-strong">
        Has it happened yet?
      </h2>
      <ul className="flex flex-col gap-3">
        {shown.map((f) => (
          <AroundNowFirst key={f.key} first={f} week={week} onNotYet={() => putOff(`${f.key}@${week}`)} />
        ))}
      </ul>
    </section>
  );
}
