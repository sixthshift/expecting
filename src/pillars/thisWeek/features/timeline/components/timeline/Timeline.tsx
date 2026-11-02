import { Button } from "@sixthshift/design-system/button";
import { cn } from "@sixthshift/design-system/utils";
import { LocateFixed } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useAppetiteQuery } from "../../../../../../api/rpc/appetite";
import { useAppointmentsQuery } from "../../../../../../api/rpc/appointments";
import { useChecklistQuery } from "../../../../../../api/rpc/checklist";
import { useFeelingsQuery } from "../../../../../../api/rpc/feelings";
import { useJournalQuery } from "../../../../../../api/rpc/journal";
import { usePapersQuery } from "../../../../../../api/rpc/papers";
import { usePhotosQuery } from "../../../../../../api/rpc/photos";
import { useQuestionsQuery } from "../../../../../../api/rpc/questions";
import { useNow, useSettingsQuery } from "../../../../../../api/rpc/settings";
import { useOutOfTheWay } from "../../../../../../app/hooks/useOutOfTheWay";
import { weekNotes } from "../../../../../../content";
import type { Week } from "../../../../../../lib/timeline";
import { timelineWeeks, timelineWindows } from "../../../../../../lib/timelineWeeks";
import { useItems } from "../../../../../library/hooks/useItems";
import { useTasks } from "../../../../../planner/features/tasks/hooks/useTasks";
import { Welcome } from "../../../../components/welcome/Welcome";
import { PregnancyStrip } from "../strip/PregnancyStrip";
import { TimelineFrame } from "../TimelineFrame";
import { TimelineWeeks } from "../weeks/TimelineWeeks";

/** Bring a week's line into view: the middle of the screen, or the top for the first weeks. */
function scrollToWeek(week: Week, smooth: boolean) {
  document.querySelector(`[data-week="${week}"]`)?.scrollIntoView({ block: "center", behavior: smooth ? "smooth" : "auto" });
}

/**
 * The whole pregnancy at once: the timeline, opened from This week. The pregnancy
 * in a line, then every week a line, under its trimester, with the landmarks.
 * A week's detail is This week's: each line goes there. What's to do across
 * the weeks is the Planner's chart. One column on a phone, and three on a
 * desktop, a trimester each.
 */
export function Timeline({ at }: { at: Week | undefined }) {
  const { data: settings } = useSettingsQuery();
  const { data: checklist } = useChecklistQuery();
  const now = useNow();
  const items = useItems();
  const tasks = useTasks();
  const { data: questions } = useQuestionsQuery();
  const { data: journal } = useJournalQuery();
  const { data: feelings } = useFeelingsQuery();
  const { data: appetite } = useAppetiteQuery();
  const { data: photos } = usePhotosQuery();
  const { data: papers } = usePapersQuery();
  const { data: appointments } = useAppointmentsQuery();
  const { dueDate } = settings;
  const due = useMemo(() => new Set(tasks.filter((t) => !checklist.ticks[t.id]).map((t) => t.due)), [tasks, checklist.ticks]);
  const away = useOutOfTheWay();
  const windows = useMemo(() => timelineWindows(items, checklist.ticks, now), [items, checklist.ticks, now]);
  const weeks = timelineWeeks({
    notes: weekNotes,
    windows,
    tasks,
    ticks: checklist.ticks,
    questions,
    journal,
    feelings,
    appetite,
    photos,
    papers,
    appointments,
    now,
    dueDate,
  });

  // Open at the week asked for, on a phone; else at the top, where the strip has today on it.
  useEffect(() => {
    if (at === undefined || window.matchMedia("(min-width: 64rem)").matches) return;
    // After the router has put the page at its top.
    const frame = requestAnimationFrame(() => scrollToWeek(at, false));
    return () => cancelAnimationFrame(frame);
  }, [at]);

  return (
    <TimelineFrame
      lead="Every week at once. Tap one to see it."
      head={
        now !== null ? (
          <div className="mt-4">
            <PregnancyStrip now={now} at={at ?? now} due={due} named />
          </div>
        ) : null
      }
    >
      {!dueDate ? <Welcome /> : null}
      {now !== null ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => scrollToWeek(now, true)}
          // Out of the way while the page scrolls down, as the "+" is; back on the way up.
          className={cn(
            "fixed bottom-[calc(var(--tab-bar)+1rem)] left-1/2 z-10 -translate-x-1/2 shadow-sm transition-[translate,opacity] duration-(--motion-base) lg:hidden",
            away ? "pointer-events-none translate-y-[calc(100%+1.5rem)] opacity-0 ease-(--ease-exit)" : "ease-(--ease-enter)"
          )}
        >
          <LocateFixed aria-hidden size={16} />
          Today
        </Button>
      ) : null}

      <TimelineWeeks weeks={weeks} at={at} />
    </TimelineFrame>
  );
}
