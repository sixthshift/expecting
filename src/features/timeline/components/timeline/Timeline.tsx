import { Button } from "@sixthshift/design-system/button";
import { LocateFixed } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useChecklist } from "../../../../api/rpc/checklist";
import { useQuestions } from "../../../../api/rpc/questions";
import { useNow, useSettings } from "../../../../api/rpc/settings";
import { weekNotes } from "../../../../content";
import type { Week } from "../../../../lib/timeline";
import { mapWeeks, mapWindows } from "../../../../lib/timelineMap";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import { Welcome } from "../../../home/components/now/Now";
import { useItems } from "../../../library/hooks/useItems";
import { useTasks } from "../../../tasks/hooks/useTasks";
import { WeekMap } from "../weekMap/WeekMap";
import { WindowsChart } from "../windowsChart/WindowsChart";

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
  const { data: settings } = useSettings();
  const { data: checklist } = useChecklist();
  const now = useNow();
  const items = useItems();
  const tasks = useTasks();
  const { data: questions } = useQuestions();
  const { dueDate } = settings;
  const windows = useMemo(() => mapWindows(items, checklist.ticks, now), [items, checklist.ticks, now]);
  const weeks = mapWeeks({ notes: weekNotes, windows, tasks, ticks: checklist.ticks, questions, now, dueDate });

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
