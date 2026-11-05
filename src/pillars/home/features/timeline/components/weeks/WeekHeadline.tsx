import { Diamond } from "lucide-react";
import type { TimelineWeek } from "../../../../../../lib/home/timelineWeeks";

/** A week's headline: today, a landmark, or its note's title. */
export function WeekHeadline({ week: w }: { week: TimelineWeek }) {
  if (w.isNow) {
    return (
      <span className="flex items-center gap-2 truncate font-medium text-fg-brand">
        Today{w.title ? <span className="truncate font-normal text-fg-strong">{w.title}</span> : null}
      </span>
    );
  }
  if (w.landmark) {
    return (
      <span className="flex items-center gap-1.5 truncate font-medium text-fg-brand">
        <Diamond aria-hidden size={12} className="shrink-0 fill-current" />
        {w.landmark}
      </span>
    );
  }
  return w.title ? <span className="truncate text-fg-normal">{w.title}</span> : null;
}
