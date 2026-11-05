import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { LANDMARKS } from "../../../../../../lib/thisWeek/timelineWeeks";
import { TRIMESTERS, type Trimester, type Week, weekLabel } from "../../../../../../lib/timeline";

/** A trimester's weeks, in order. */
const weeksOf = (t: Trimester): Week[] => Array.from({ length: t.to - t.from + 1 }, (_, i) => t.from + i);
/** The strip's three columns, a trimester each, as wide as its weeks; every row shares them, with a breath between. */
const COLUMNS = { gridTemplateColumns: TRIMESTERS.map((t) => `${t.to - t.from + 1}fr`).join(" ") };
/** The middle of a week across its trimester, as a percentage. */
const mid = (t: Trimester, week: number) => `${((week - t.from + 0.5) / (t.to - t.from + 1)) * 100}%`;
const SHORT = { 1: "First", 2: "Second", 3: "Third" } as const;

/**
 * The whole pregnancy in a line: a bar a week, the weeks behind tinted and
 * the weeks ahead a track of near the same weight, so it reads as the whole
 * 42 with you on it rather than a bar filling up; this one solid, the one looked at ringed, a dot under each week ahead with
 * something best done by then; the landmarks above and the trimesters below.
 * A week goes to This week at that week, as the steps beside it do; the strip
 * is a quicker way there for a finger, so it's left out of the tab order and
 * read as words by the line beside it.
 *
 * `named` gives the landmarks their names, where there's room (the timeline's head).
 */
export function PregnancyStrip({ now, at, due, named = false }: { now: Week; at: Week; due: ReadonlySet<Week>; named?: boolean }) {
  return (
    <div aria-hidden className="flex w-full flex-col gap-1.5">
      <div className="grid h-4 gap-1 text-[0.625rem] font-medium text-fg-brand" style={COLUMNS}>
        {TRIMESTERS.map((t) => (
          <div key={t.n} className="relative">
            {Object.entries(LANDMARKS)
              .filter(([w]) => Number(w) >= t.from && Number(w) <= t.to)
              .map(([w, label]) => {
                // The mark sits on its week; its name reads to the right, or to the left when the next landmark is close (Full term, before the due date).
                const crowded = Object.keys(LANDMARKS).some((o) => Number(o) > Number(w) && Number(o) - Number(w) <= 4);
                const name = named && Number(w) !== 40;
                return (
                  <span
                    key={w}
                    className={cn("absolute top-0 flex items-center gap-1 whitespace-nowrap", crowded && "flex-row-reverse")}
                    style={{ left: mid(t, Number(w)), transform: crowded && name ? "translateX(calc(-100% + 0.25rem))" : "translateX(-0.25rem)" }}
                  >
                    <span className="w-2 text-center">◆</span>
                    {name ? <span>{label}</span> : null}
                  </span>
                );
              })}
          </div>
        ))}
      </div>
      <div className="grid h-6 gap-2" style={COLUMNS}>
        {TRIMESTERS.map((t) => (
          <div key={t.n} className="grid gap-px" style={{ gridTemplateColumns: `repeat(${t.to - t.from + 1}, minmax(0, 1fr))` }}>
            {weeksOf(t).map((w) => (
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
                      ? "bg-bg-brand-subtle-hovered hover:bg-bg-brand-subtle-pressed"
                      : "bg-border-subtle hover:bg-border-normal",
                  // Above its neighbours, which come later and would paint over the ring.
                  w === at && w !== now && "z-10 ring-2 ring-border-brand-strong ring-offset-1 ring-offset-(--expecting-page)"
                )}
              >
                {w > now && due.has(w) ? <span className="absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-fg-subtle" /> : null}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1 grid gap-2 text-[0.625rem] font-semibold tracking-widest text-fg-subtle uppercase" style={COLUMNS}>
        {TRIMESTERS.map((t) => (
          <span key={t.n}>{SHORT[t.n]}</span>
        ))}
      </div>
    </div>
  );
}
