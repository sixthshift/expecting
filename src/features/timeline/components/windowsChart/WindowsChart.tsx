import { cn } from "@sixthshift/design-system/utils";
import type { CSSProperties } from "react";
import { WEEKS, type Week, weekLabel } from "../../../../lib/timeline";
import { LANDMARKS, type MapWindow, TRIMESTERS, trimester, type WindowState } from "../../../../lib/timelineMap";
import { ItemLink } from "../../../library/components/ItemLink";

const SPAN = WEEKS.last - WEEKS.first + 1;
const WEEK_LIST = Array.from({ length: SPAN }, (_, i) => i + WEEKS.first);
/** Where a week starts across the chart, as a percentage. */
const x = (week: number) => `${((week - WEEKS.first) / SPAN) * 100}%`;
/** The middle of a week. */
const mid = (week: number) => `calc(${x(week)} + ${100 / SPAN / 2}%)`;
const width = (from: Week, to: Week) => `${((to - from + 1) / SPAN) * 100}%`;

/** A window's colour by where it stands: open now is the brand, ahead a lighter one, behind and done quiet. */
const TONE: Record<WindowState, string> = {
  open: "bg-fg-brand",
  ahead: "bg-bg-brand-subtle border border-border-brand",
  past: "bg-border-normal",
  done: "bg-border-normal",
};

const STATE: Record<WindowState, string> = { open: "open now", ahead: "ahead", past: "closed", done: "done" };

const SHORT = { 1: "First", 2: "Second", 3: "Third" } as const;

/**
 * The windows across the whole pregnancy: one row each, a bar from its first
 * week to its last, the trimesters behind them, the landmarks as faint lines,
 * today as a line. What overlaps, what's open now and what's next, at a
 * glance. Each row goes to its item.
 *
 * Desktop: the labels in a column beside the chart. Phone: the chart the
 * width of the screen, each label over its bar, starting where the bar does
 * (or ending where it does, for one late in the pregnancy, so it stays on screen),
 * in two lines if it needs them, and haloed in the page's colour so the lines
 * behind it (today, the landmarks) don't run through the words. A key says
 * what the bars' colours mean.
 */
export function WindowsChart({ windows, now }: { windows: readonly MapWindow[]; now: Week | null }) {
  const trimesters = ([1, 2, 3] as const).map((t) => {
    const weeks = WEEK_LIST.filter((w) => trimester(w) === t);
    return { t, from: weeks[0]!, to: weeks.at(-1)! };
  });

  return (
    <section aria-labelledby="windows" className="flex flex-col gap-3 pb-8">
      <h2 id="windows" className="text-lg font-display font-semibold text-fg-strong">
        What to do, and when
      </h2>
      <Key />
      <div className="relative">
        {/* Behind everything, across the chart (beside the labels on a desktop). */}
        <div aria-hidden className="absolute inset-y-0 right-0 left-0 lg:left-56">
          {trimesters.map(({ t, from, to }) => (
            <div
              key={t}
              className={cn("absolute inset-y-0 border-l border-border-subtle", t === 2 && "bg-bg-subtle/60")}
              style={{ left: x(from), width: width(from, to) }}
            >
              <span className="block truncate px-1.5 pt-0.5 text-xs font-semibold tracking-widest text-fg-subtle uppercase lg:px-2">
                <span className="lg:hidden">{SHORT[t]}</span>
                <span className="hidden lg:inline">{TRIMESTERS[t]}</span>
              </span>
            </div>
          ))}
          {Object.keys(LANDMARKS).map((w) => (
            <div key={w} className="absolute top-10 bottom-0 border-l border-dashed border-border-brand" style={{ left: mid(Number(w)) }} />
          ))}
          {now !== null ? (
            <div className="absolute inset-y-0 w-0.5 bg-fg-brand" style={{ left: mid(now) }}>
              <span className="absolute -bottom-6 -translate-x-1/2 rounded-sm bg-bg-brand-strong px-1.5 text-xs font-medium whitespace-nowrap text-fg-on-brand-strong">
                {weekLabel(now)}
              </span>
            </div>
          ) : null}
        </div>

        {/* The landmarks, and a number every four weeks. */}
        <div aria-hidden className="relative h-16 lg:ml-56">
          {Object.entries(LANDMARKS).map(([w, label]) => {
            // A label reads to the right of its mark, unless the next landmark is close: then to the left.
            const crowded = Object.keys(LANDMARKS).some((o) => Number(o) > Number(w) && Number(o) - Number(w) <= 4);
            return (
              <span
                key={w}
                className={cn(
                  "absolute top-5 flex items-center gap-1 text-xs font-medium whitespace-nowrap text-fg-brand",
                  crowded ? "-translate-x-full flex-row-reverse pr-px" : "-translate-x-1.5"
                )}
                style={{ left: mid(Number(w)) }}
              >
                <span className="text-[0.625rem]">◆</span>
                {/* A phone has room for the marks only; the weeks below name them. */}
                <span className="hidden lg:inline">{label}</span>
              </span>
            );
          })}
          {WEEK_LIST.filter((w) => w === 1 || w % 4 === 0).map((w) => (
            <span key={w} className="absolute bottom-1 -translate-x-1/2 text-xs text-fg-subtle tabular-nums" style={{ left: mid(w) }}>
              {w}
            </span>
          ))}
        </div>

        <ul className="relative flex flex-col gap-1 lg:gap-0">
          {windows.map((w) => {
            const late = w.from > SPAN / 2;
            const place = { "--start": x(w.from), "--end": `calc(100% - ${x(w.to + 1)})` } as CSSProperties;
            return (
              <li key={w.item.id}>
                <ItemLink
                  itemId={w.item.id}
                  aria-label={`${w.item.title}, weeks ${w.from} to ${w.to}, ${STATE[w.state]}`}
                  className="group flex flex-col gap-1 rounded-sm py-0.5 lg:h-8 lg:flex-row lg:items-center lg:gap-0 lg:py-0"
                  style={place}
                >
                  <span
                    className={cn(
                      "line-clamp-2 text-sm [text-shadow:0_0_2px_var(--expecting-page),0_0_4px_var(--expecting-page),0_0_6px_var(--expecting-page)] group-hover:underline lg:line-clamp-none lg:w-56 lg:shrink-0 lg:truncate lg:pr-4 lg:pl-0 lg:text-left lg:[text-shadow:none]",
                      late ? "pr-(--end) text-right" : "pl-(--start)",
                      w.state === "open" ? "font-medium text-fg-strong" : "text-fg-subtle"
                    )}
                  >
                    {w.item.title}
                  </span>
                  <span aria-hidden className="relative h-3 lg:flex-1">
                    <span
                      className={cn("absolute inset-y-0 rounded-full group-hover:opacity-80", TONE[w.state])}
                      style={{ left: x(w.from), width: width(w.from, w.to) }}
                    />
                  </span>
                </ItemLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** What the bars' colours say, in the order they come: open now, ahead, then closed or done. */
function Key() {
  const keys: { state: WindowState; label: string }[] = [
    { state: "open", label: "Open now" },
    { state: "ahead", label: "Ahead" },
    { state: "past", label: "Closed or done" },
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-subtle">
      {keys.map(({ state, label }) => (
        <li key={state} className="flex items-center gap-1.5">
          <span aria-hidden className={cn("h-2.5 w-5 rounded-full", TONE[state])} />
          {label}
        </li>
      ))}
    </ul>
  );
}
