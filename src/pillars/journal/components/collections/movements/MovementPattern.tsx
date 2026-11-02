import { cn } from "@sixthshift/design-system/utils";
import { useJournalQuery } from "../../../../../api/rpc/journal";
import { todayISO } from "../../../../../lib/dates";
import { dayFraction, formatTime, movementPattern, PATTERN_DAYS } from "../../../../../lib/journal";
import { weekdayDate } from "../../../../../lib/labels";

/**
 * The last fortnight's movements, a row a day, each a dot at its time of
 * day, so the baby's rhythm shows. No totals and no line for what's usual;
 * one felt as different is ringed, never red.
 */
export function MovementPattern() {
  const { data: journal } = useJournalQuery();
  const today = todayISO();
  const days = movementPattern(journal, today);
  if (days.length === 0) return null;

  return (
    <figure className="flex flex-col gap-1">
      <figcaption className="text-sm text-fg-subtle">The last {PATTERN_DAYS / 7} weeks, a dot for each movement kept, at its time of day.</figcaption>
      <ol className="flex flex-col gap-1">
        {days.map((d) => (
          <li key={d.day} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-fg-subtle">{weekdayDate(d.day, today)}</span>
            <span className="sr-only">{d.moved.map((m) => formatTime(m.time) + (m.different ? ", slower, weaker or stopped" : "")).join("; ")}</span>
            <span aria-hidden className="relative h-4 flex-1 rounded-full bg-bg-subtle">
              {d.moved.map((m) => (
                <span
                  key={m.id}
                  style={{ left: `${dayFraction(m.time) * 100}%` }}
                  className={cn(
                    "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
                    m.different ? "bg-bg-normal ring-2 ring-fg-brand" : "bg-fg-brand"
                  )}
                />
              ))}
            </span>
          </li>
        ))}
      </ol>
      <div aria-hidden className="flex gap-3 text-xs text-fg-subtle">
        <span className="w-24 shrink-0" />
        <span className="flex flex-1 justify-between">
          <span>Midnight</span>
          <span>Midday</span>
          <span>Midnight</span>
        </span>
      </div>
    </figure>
  );
}
