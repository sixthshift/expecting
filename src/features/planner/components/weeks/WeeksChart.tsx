import { cn } from "@sixthshift/design-system/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { STAGES } from "../../../../lib/planner/plan";
import type { Chart } from "../../../../lib/planner/weeks";
import { TRIMESTERS, type Week, weekLabel } from "../../../../lib/timeline";
import { LANDMARKS } from "../../../../lib/timelineWeeks";
import { Bars } from "./Bars";
import { Key } from "./Key";
import { StageGroup } from "./StageGroup";
import { mid, WEEK_LIST, width, x } from "./scale";

const SHORT = { 1: "First", 2: "Second", 3: "Third" } as const;

/**
 * The weeks: what's to do as a chart, every task a bar, from when it opens to when
 * it closes, a notch at its best-by week, grouped as To do is (To do now, then
 * a group per stage), with the trimesters behind, the stages' ends as dashed
 * lines, the landmarks, and today as a line. What's earlier and done is folded
 * at the foot. A stage opened from its card (`focus`) is shaded.
 *
 * Desktop: the labels in a column beside the chart. Phone: the chart the width
 * of the screen, each label over its bar, starting where the bar does (or
 * ending where it does, for one late in the pregnancy, so it stays on screen),
 * haloed in the page's colour so the lines behind it don't run through the words.
 */
export function WeeksChart({ chart, now, focus }: { chart: Chart; now: Week | null; focus: { start: Week; end: Week } | null }) {
  const [earlierOpen, setEarlierOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Key />
      <div className="relative">
        {/* Behind everything, across the chart (beside the labels on a desktop). */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 left-0 lg:left-64">
          {TRIMESTERS.map(({ n: t, from, to, title }) => (
            <div
              key={t}
              className={cn("absolute inset-y-0 border-l border-border-subtle", t === 2 && "bg-bg-subtle/60")}
              style={{ left: x(from), width: width(from, to) }}
            >
              <span className="block truncate px-1.5 pt-0.5 text-xs font-semibold tracking-widest text-fg-subtle uppercase lg:px-2">
                <span className="lg:hidden">{SHORT[t]}</span>
                <span className="hidden lg:inline">{title}</span>
              </span>
            </div>
          ))}
          {focus ? (
            <div className="absolute top-10 bottom-0 rounded-sm bg-bg-brand-subtle/70" style={{ left: x(focus.start), width: width(focus.start, focus.end) }} />
          ) : null}
          {STAGES.slice(0, -1).map((s) => (
            <div key={s.end} className="absolute top-10 bottom-0 border-l border-dashed border-border-brand opacity-60" style={{ left: x(s.end + 1) }} />
          ))}
          {now !== null ? (
            <div className="absolute inset-y-0 w-0.5 bg-fg-brand" style={{ left: mid(now) }}>
              <span className="absolute top-5 -translate-x-1/2 rounded-sm bg-bg-brand-strong px-1.5 text-xs font-medium whitespace-nowrap text-fg-on-brand-strong">
                {weekLabel(now)}
              </span>
            </div>
          ) : null}
        </div>

        {/* The landmarks, and a number every four weeks. */}
        <div aria-hidden className="relative h-20 lg:ml-64">
          {Object.entries(LANDMARKS).map(([w, label]) => {
            // A label reads to the right of its mark, unless the next landmark is close: then to the left.
            const crowded = Object.keys(LANDMARKS).some((o) => Number(o) > Number(w) && Number(o) - Number(w) <= 4);
            return (
              <span
                key={w}
                className={cn(
                  "absolute top-10 flex items-center gap-1 text-xs font-medium whitespace-nowrap text-fg-brand",
                  crowded ? "-translate-x-full flex-row-reverse pr-px" : "-translate-x-1.5"
                )}
                style={{ left: mid(Number(w)) }}
              >
                <span className="text-[0.625rem]">◆</span>
                {/* A phone has room for the marks only. */}
                <span className="hidden lg:inline">{label}</span>
              </span>
            );
          })}
          {WEEK_LIST.filter((w) => w === 1 || w % 4 === 0).map((w) => (
            <span key={w} className="absolute bottom-0 -translate-x-1/2 text-xs text-fg-subtle tabular-nums" style={{ left: mid(w) }}>
              {w}
            </span>
          ))}
        </div>

        <div className="relative mt-2 flex flex-col gap-5">
          {chart.groups.map((group) => (
            <StageGroup key={group.key} group={group} focused={focus !== null && group.key === focus.end} now={now} />
          ))}
          {chart.earlier.length > 0 ? (
            <section className="flex flex-col gap-1">
              <button
                type="button"
                aria-expanded={earlierOpen}
                onClick={() => setEarlierOpen((o) => !o)}
                className="flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-fg-normal"
              >
                Earlier and done <span className="font-normal text-fg-subtle">{chart.earlier.length}</span>
                <ChevronDown aria-hidden size={16} className={earlierOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
              {earlierOpen ? <Bars bars={chart.earlier} /> : null}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
