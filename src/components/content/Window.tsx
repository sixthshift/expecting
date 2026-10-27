import { useEffect, useState } from "react";
import { PREGNANCY_WEEKS } from "../../lib/timeline";
import { useContentContext } from "./context";

const SPAN = PREGNANCY_WEEKS.last - PREGNANCY_WEEKS.first + 1;
const at = (week: number) => `${((week - PREGNANCY_WEEKS.first) / SPAN) * 100}%`;
const weeks = (n: number) => (n === 1 ? "1 week" : `${n} weeks`);

/** Where this household stands against the window, in words. */
function status(from: number, to: number, now: ReturnType<typeof useContentContext>["now"]): string {
  if (!now) return `Weeks ${from}–${to}`;
  if (now.phase === "before") return `Opens at ${from} weeks`;
  if (now.phase === "postpartum" || now.week > to) return `Closed at ${to} weeks`;
  if (now.week < from) return `Opens in ${weeks(from - now.week)}, at ${from} weeks`;
  return now.week === to ? "Open now · its last week" : `Open now · ${weeks(to - now.week)} left`;
}

/**
 * `{% window from=28 to=36 /%}`: the weeks something can happen, drawn across
 * the whole pregnancy, with this household's week on it. The window sweeps
 * open as it appears (not for anyone who has asked for less motion).
 */
export function Window({ from, to }: { from: number; to: number }) {
  const { now } = useContentContext();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(true), []);
  const here = now?.phase === "pregnancy" ? now.week : null;

  return (
    <figure className="mt-3 flex flex-col gap-1.5" aria-label={`Weeks ${from} to ${to} of the pregnancy. ${status(from, to, now)}.`}>
      <div aria-hidden className="relative h-6">
        <div className="absolute inset-x-0 top-2.5 h-1 rounded-full bg-bg-subtle" />
        <div
          className="absolute top-1.5 h-3 origin-left rounded-full bg-linear-to-r from-(--expecting-accent-from) to-(--expecting-accent-to) motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
          style={{ left: at(from), width: at(PREGNANCY_WEEKS.first + to - from + 1), transform: `scaleX(${open ? 1 : 0})` }}
        />
        {here !== null ? (
          <span className="absolute top-0 -translate-x-1/2" style={{ left: `calc(${at(here)} + ${50 / SPAN}%)` }}>
            <span className="absolute inset-0 rounded-full bg-fg-brand opacity-40 motion-safe:animate-ping" />
            <span className="relative block size-6 rounded-full border-2 border-bg-normal bg-fg-brand" />
          </span>
        ) : null}
      </div>
      <div aria-hidden className="relative h-4 text-xs text-fg-subtle tabular-nums">
        <span className="absolute -translate-x-1/2" style={{ left: at(from) }}>
          {from}
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: at(to + 1) }}>
          {to}
        </span>
        <span className="absolute right-0">{PREGNANCY_WEEKS.last}</span>
      </div>
      <figcaption className="text-sm font-medium text-fg-strong">{status(from, to, now)}</figcaption>
    </figure>
  );
}
