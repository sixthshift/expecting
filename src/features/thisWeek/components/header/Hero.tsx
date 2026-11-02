import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useChecklistQuery } from "../../../../api/rpc/checklist";
import { sizeLabel, sizeLine } from "../../../../content/weeks";
import { weekRange } from "../../../../lib/labels";
import { weekFromNow, weekLabel } from "../../../../lib/timeline";
import { useTasks } from "../../../tasks/hooks/useTasks";
import { PregnancyStrip } from "../../../timeline/components/strip/PregnancyStrip";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";
import { SizeIcon } from "../sizeIcon/SizeIcon";
import { NowLine } from "./NowLine";
import { WeekStepper } from "./WeekStepper";

/**
 * The top of This week: where you are, as a page heading ("Week 28"), the
 * baby's size when that week's own note gives it, and how far along you are.
 * Peeking at another week, the heading is that week, as seen from this one
 * ("Next week"), with its dates. Under it the whole pregnancy in a line (a
 * week goes to that week) and the way to the timeline; then a step back or ahead.
 */
export function Hero() {
  const { week, position, dueDate, note, peeking } = useThisWeekPage();
  const { data: checklist } = useChecklistQuery();
  const tasks = useTasks();
  // The weeks with something still to do best done by then, dotted on the strip.
  const due = useMemo(() => new Set(tasks.filter((t) => !checklist.ticks[t.id]).map((t) => t.due)), [tasks, checklist.ticks]);
  if (week === null || !position || !dueDate) return null;
  // The size, when that week's own note gives it.
  const size = note?.week === week ? note.size : null;
  const line = size ? sizeLine(size) : null;
  const range = weekRange(week, dueDate);
  return (
    // Its parts sit in the header's grid (ThisWeek): the heading beside the phone's corner, the size line under it with
    // the size's drawing at its right, under the corner; on a desktop, with no corner, the drawing is opposite the week.
    <div className="contents">
      <h1 className="col-start-1 row-start-1 flex flex-col text-fg-strong">
        <span className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">{weekFromNow(week, position.week)}</span>
        <span className="text-4xl font-display font-semibold lg:text-5xl">{weekLabel(week)}</span>
      </h1>
      {/* One line, kept on every week, so going week to week moves nothing under it; a narrow phone cuts it short (read out whole), and the sentence is its title. On a phone it leaves room at its end for the drawing. */}
      <p className="col-span-full row-start-2 self-center truncate pr-13 text-fg-normal lg:pr-0" title={size ? sizeLabel(size) : undefined}>
        {line ?? "\u00a0"}
      </p>
      {/* Its place is kept on a week without one, so the header is the same height every week. */}
      <div className="col-start-2 row-start-2 size-10 justify-self-end lg:row-start-1 lg:size-14 lg:self-end">
        {size?.like ? <SizeIcon like={size.like} className="size-full" /> : null}
      </div>
      <div className="col-span-full flex flex-col gap-2 pt-1">
        <PregnancyStrip now={position.week} at={week} due={due} />
        <div className="flex flex-wrap items-center justify-between gap-x-4">
          {peeking ? range ? <p className="text-sm text-fg-subtle">{range}</p> : <span /> : <NowLine />}
          <Link
            to="/timeline"
            search={peeking ? { at: week } : {}}
            className="flex min-h-11 items-center gap-1 text-sm font-medium text-fg-brand hover:underline"
          >
            The whole pregnancy
            <ChevronRight aria-hidden size={16} />
          </Link>
        </div>
      </div>
      <div className="col-span-full">
        <WeekStepper />
      </div>
    </div>
  );
}
