import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { allWeeks, WEEKS, type Week, weekLabel } from "../../../../lib/timeline";
import { LANDMARKS, trimester } from "../../../../lib/timelineMap";

const SPAN = WEEKS.last - WEEKS.first + 1;
/** The middle of a week across the strip, as a percentage. */
const mid = (week: number) => `${((week - WEEKS.first + 0.5) / SPAN) * 100}%`;
const SHORT = { 1: "First", 2: "Second", 3: "Third" } as const;

/**
 * The whole pregnancy in a line: a bar a week, the weeks behind tinted, this
 * one solid, the one looked at ringed, a dot under each week ahead with
 * something best done by then; the landmarks above and the trimesters below.
 * A week goes to This week at that week, as the steps beside it do; the strip
 * is a quicker way there for a finger, so it's left out of the tab order and
 * read as words by the line beside it.
 *
 * `named` gives the landmarks their names, where there's room (the map's head).
 */
export function PregnancyStrip({ now, at, due, named = false }: { now: Week; at: Week; due: ReadonlySet<Week>; named?: boolean }) {
  return (
    <div aria-hidden className="flex w-full flex-col gap-1.5">
      <div className="relative h-4 text-[0.625rem] font-medium text-fg-brand">
        {Object.entries(LANDMARKS).map(([w, label]) => (
          <span key={w} className="absolute top-0 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap" style={{ left: mid(Number(w)) }}>
            ◆{named && Number(w) !== 40 ? <span>{label}</span> : null}
          </span>
        ))}
      </div>
      <div className="grid h-6 grid-cols-[repeat(42,minmax(0,1fr))] gap-px">
        {allWeeks().map((w) => (
          <Link
            key={w}
            to="/"
            search={w === now ? {} : { at: w }}
            tabIndex={-1}
            title={weekLabel(w)}
            className={cn(
              "relative rounded-[2px] transition-colors",
              w === now
                ? "-my-1 bg-fg-brand"
                : w < now
                  ? "bg-bg-brand-subtle-pressed hover:bg-bg-brand-subtle-hovered"
                  : "bg-bg-subtle hover:bg-bg-subtle-pressed",
              w === at && w !== now && "ring-2 ring-border-brand-strong ring-offset-1 ring-offset-(--expecting-page)",
              // A breath between the trimesters.
              w > WEEKS.first && trimester(w) !== trimester(w - 1) && "ml-0.5"
            )}
          >
            {w > now && due.has(w) ? <span className="absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-fg-subtle" /> : null}
          </Link>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-[13fr_14fr_15fr] text-[0.625rem] font-semibold tracking-widest text-fg-subtle uppercase">
        {([1, 2, 3] as const).map((t) => (
          <span key={t} className={t > 1 ? "pl-1" : undefined}>
            {SHORT[t]}
          </span>
        ))}
      </div>
    </div>
  );
}
