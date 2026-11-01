import { cn } from "@sixthshift/design-system/utils";
import { ChevronDown } from "lucide-react";
import { type CSSProperties, type ReactNode, useState } from "react";
import type { Bar, BarGroup, BarState, Chart } from "../../../../lib/acrossTheWeeks";
import { STAGES } from "../../../../lib/planner";
import { WEEKS, type Week, weekLabel } from "../../../../lib/timeline";
import { LANDMARKS, TRIMESTERS, trimester } from "../../../../lib/timelineMap";
import { ItemLink } from "../../../library/components/ItemLink";

const SPAN = WEEKS.last - WEEKS.first + 1;
const WEEK_LIST = Array.from({ length: SPAN }, (_, i) => i + WEEKS.first);
/** Where a week starts across the chart, as a percentage. */
const x = (week: number) => `${((week - WEEKS.first) / SPAN) * 100}%`;
/** The middle of a week. */
const mid = (week: number) => `calc(${x(week)} + ${100 / SPAN / 2}%)`;
const width = (from: Week, to: Week) => `${((to - from + 1) / SPAN) * 100}%`;

/** A bar's colour by where it stands: open now is the brand, ahead a lighter one, late a warning, done quiet. */
const TONE: Record<BarState, string> = {
  open: "bg-fg-brand",
  ahead: "bg-bg-brand-subtle border border-border-brand",
  late: "bg-bg-warning-subtle border border-border-warning",
  done: "bg-border-normal",
};

const STATE: Record<BarState, string> = { open: "open now", ahead: "ahead", late: "past its best-by week", done: "done" };

const SHORT = { 1: "First", 2: "Second", 3: "Third" } as const;

/**
 * What's to do, across the weeks: every task a bar, from when it opens to when
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
  const trimesters = ([1, 2, 3] as const).map((t) => {
    const weeks = WEEK_LIST.filter((w) => trimester(w) === t);
    return { t, from: weeks[0]!, to: weeks.at(-1)! };
  });

  return (
    <div className="flex flex-col gap-3">
      <Key />
      <div className="relative">
        {/* Behind everything, across the chart (beside the labels on a desktop). */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 left-0 lg:left-64">
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
            <Group key={group.key} group={group} focused={focus !== null && group.key === focus.end} now={now} />
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

function Group({ group, focused, now }: { group: BarGroup; focused: boolean; now: Week | null }) {
  const left = group.key === "now" || now === null ? null : group.end - now;
  return (
    <section aria-labelledby={`stage-${group.key}`} data-stage={group.key} className="flex scroll-mt-24 flex-col gap-1">
      <h2 id={`stage-${group.key}`} className={cn("flex items-baseline gap-2 text-sm font-semibold lg:w-64", focused ? "text-fg-brand" : "text-fg-strong")}>
        <span>{group.title}</span>
        {group.key === "now" ? null : (
          <span className="text-xs font-normal text-fg-subtle">
            {weekLabel(group.end)}
            {left === null ? null : left <= 0 ? " · this week" : ` · in ${left} ${left === 1 ? "week" : "weeks"}`}
          </span>
        )}
      </h2>
      <Bars bars={group.bars} />
    </section>
  );
}

function Bars({ bars }: { bars: readonly Bar[] }) {
  return (
    <ul className="flex flex-col gap-1 lg:gap-0">
      {bars.map((bar) => (
        <li key={bar.task.id}>
          <BarRow bar={bar} />
        </li>
      ))}
    </ul>
  );
}

/** One task: its title over its bar on a phone, beside it on a desktop; to its item, when it has one. */
function BarRow({ bar }: { bar: Bar }) {
  const { task, from, due, to, state } = bar;
  const late = from > SPAN / 2;
  const place = { "--start": x(from), "--end": `calc(100% - ${x(to + 1)})` } as CSSProperties;
  const label = `${task.title}: opens ${weekLabel(from).toLowerCase()}, best by ${weekLabel(due).toLowerCase()}, closes ${weekLabel(to).toLowerCase()}, ${STATE[state]}`;
  const inner: ReactNode = (
    <>
      <span
        className={cn(
          "line-clamp-2 text-sm [text-shadow:0_0_2px_var(--expecting-page),0_0_4px_var(--expecting-page),0_0_6px_var(--expecting-page)] lg:line-clamp-none lg:w-64 lg:shrink-0 lg:truncate lg:pr-4 lg:pl-0 lg:text-left lg:[text-shadow:none]",
          task.itemId && "group-hover:underline",
          late ? "pr-(--end) text-right" : "pl-(--start)",
          state === "open" || state === "late" ? "font-medium text-fg-strong" : "text-fg-subtle",
          state === "done" && "line-through"
        )}
      >
        {task.title}
      </span>
      <span aria-hidden className="relative h-3 lg:flex-1">
        <span className={cn("absolute inset-y-0 rounded-full group-hover:opacity-80", TONE[state])} style={{ left: x(from), width: width(from, to) }} />
        {state === "done" ? null : (
          <span
            className={cn("absolute -inset-y-1 w-1 -translate-x-1/2 rounded-full", state === "ahead" ? "bg-fg-brand" : "bg-fg-strong")}
            style={{ left: mid(due) }}
          />
        )}
      </span>
    </>
  );
  const row = "group flex flex-col gap-1 rounded-sm py-0.5 lg:h-8 lg:flex-row lg:items-center lg:gap-0 lg:py-0";
  return task.itemId ? (
    <ItemLink itemId={task.itemId} aria-label={label} className={row} style={place}>
      {inner}
    </ItemLink>
  ) : (
    // biome-ignore lint/a11y/useSemanticElements: a row of the chart, read as one thing; it goes nowhere, so it isn't a link.
    <div role="group" aria-label={label} className={row} style={place}>
      {inner}
    </div>
  );
}

/** What the bars say, in the order they come: open now, ahead, late, done, and the notch. */
function Key() {
  const keys: { state: BarState; label: string }[] = [
    { state: "open", label: "Open now" },
    { state: "ahead", label: "Ahead" },
    { state: "late", label: "Past its best-by week" },
    { state: "done", label: "Done" },
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-subtle">
      {keys.map(({ state, label }) => (
        <li key={state} className="flex items-center gap-1.5">
          <span aria-hidden className={cn("h-2.5 w-5 rounded-full", TONE[state])} />
          {label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-3.5 w-1 rounded-full bg-fg-strong" />
        Best by
      </li>
    </ul>
  );
}
