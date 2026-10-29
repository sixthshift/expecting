import { Button } from "@sixthshift/design-system/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LocateFixed } from "lucide-react";
import { useEffect, useMemo } from "react";
import { weekNotes } from "../../content";
import { todayISO } from "../../lib/dates";
import type { Week } from "../../lib/timeline";
import { mapWeeks, mapWindows } from "../../lib/timelineMap";
import { PillarHeader } from "../app/PillarLayout";
import { Welcome } from "../home/Now";
import { householdQuery, questionsQuery } from "../household/load";
import { workOut } from "../household/workOut";
import { WeekMap } from "./WeekMap";
import { WindowsChart } from "./WindowsChart";

/** Bring a week's line into view: the middle of the screen, or the top for the first weeks. */
function scrollToWeek(week: Week, smooth: boolean) {
  document.querySelector(`[data-week="${week}"]`)?.scrollIntoView({ block: "center", behavior: smooth ? "smooth" : "auto" });
}

/**
 * The whole pregnancy at once: the map. Every week a line, under its
 * trimester, with the landmarks; the windows, what each asks of you and
 * across which weeks. A week's detail is This week's: each line goes there.
 *
 * The windows are a chart across the pregnancy, the width of the screen on a
 * phone; the weeks below it are one column on a phone, and three on a
 * desktop, a trimester each.
 */
export function Timeline({ at }: { at: Week | undefined }) {
  const { data: state } = useSuspenseQuery(householdQuery);
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const today = todayISO();
  const { now, items, tasks } = useMemo(() => workOut(state, today), [state, today]);
  const { dueDate } = state.household;
  const windows = useMemo(() => mapWindows(items, state.ticks, now), [items, state.ticks, now]);
  const weeks = mapWeeks({ notes: weekNotes, windows, tasks, ticks: state.ticks, questions, now, dueDate });

  // Open at the top, where the chart has today on it; or at the week asked for, on a phone.
  useEffect(() => {
    if (at === undefined || window.matchMedia("(min-width: 64rem)").matches) return;
    // After the router has put the page at its top.
    const frame = requestAnimationFrame(() => scrollToWeek(at, false));
    return () => cancelAnimationFrame(frame);
  }, [at]);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Timeline" lead="The whole pregnancy at once. Tap a week to see it." />
      {!dueDate ? <Welcome /> : null}
      {now !== null ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => scrollToWeek(now, true)}
          className="fixed bottom-[calc(var(--tab-bar)+1rem)] left-1/2 z-10 -translate-x-1/2 shadow-sm lg:hidden"
        >
          <LocateFixed aria-hidden size={16} />
          Today
        </Button>
      ) : null}

      <div className="mb-10">
        <WindowsChart windows={windows} now={now} />
      </div>
      <WeekMap weeks={weeks} at={at} />
    </main>
  );
}
