import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useChecklistQuery } from "../../../../api/rpc/checklist";
import { MobileBar } from "../../../../app/mobile/components/MobileBar";
import { sizeLabel, sizeLine } from "../../../../content/weeks";
import { toGo, weekRange } from "../../../../lib/labels";
import { gestationLabel, weekFromNow, weekLabel } from "../../../../lib/timeline";
import { useTasks } from "../../../planner/features/tasks/hooks/useTasks";
import { WeekStepper } from "../../components/header/WeekStepper";
import { SizeIcon } from "../../components/sizeIcon/SizeIcon";
import { Welcome } from "../../components/welcome/Welcome";
import { useHomePage } from "../../contexts/HomePageContext";
import { PregnancyStrip } from "../../features/timeline/components/strip/PregnancyStrip";

/**
 * The top of Home on a phone: the week in the bar that stays at the top
 * (`MobileBar`), "Week 30 · 30+3", read as "This week Week 30" (a peek shows
 * which: "Next week · Week 31"); under it, in a line, the baby's size and
 * how long to go (a peek, its dates), the whole pregnancy as a strip, and
 * the steps to the week before and after beside the way to the timeline.
 * Until there's a due date, "Home" and the welcome.
 */
export function WeekTop() {
  const { week, position, dueDate, note, peeking, today } = useHomePage();
  const { data: checklist } = useChecklistQuery();
  const tasks = useTasks();
  // The weeks with something still to do best done by then, dotted on the strip.
  const due = useMemo(() => new Set(tasks.filter((t) => !checklist.ticks[t.id]).map((t) => t.due)), [tasks, checklist.ticks]);

  if (week === null || !position || !dueDate) {
    return (
      <div className="flex flex-col gap-6">
        <MobileBar>
          <h1 className="min-w-0 flex-1 truncate font-display text-xl font-semibold text-fg-strong">Home</h1>
        </MobileBar>
        {!dueDate ? <Welcome /> : null}
      </div>
    );
  }

  const size = note?.week === week ? note.size : null;
  const line = [size ? sizeLine(size) : null, peeking ? weekRange(week, dueDate) : toGo(today, dueDate)].filter(Boolean).join(" · ");
  return (
    <div className="flex flex-col gap-2">
      <MobileBar>
        <div className="min-w-0 flex-1 truncate">
          <h1 className="inline text-fg-strong">
            <span className={peeking ? "mr-1.5 text-sm text-fg-subtle" : "sr-only"}>{weekFromNow(week, position.week)}</span>{" "}
            <span className="font-display text-xl font-semibold">{weekLabel(week)}</span>
          </h1>
          {peeking ? null : <span className="text-sm text-fg-subtle"> · {gestationLabel(position.gestationDays)}</span>}
        </div>
      </MobileBar>
      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 truncate text-sm text-fg-normal" title={size ? sizeLabel(size) : undefined}>
          {line}
        </p>
        <div className="size-8 shrink-0">{size?.like ? <SizeIcon like={size.like} className="size-full" /> : null}</div>
      </div>
      <PregnancyStrip now={position.week} at={week} due={due} />
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        <WeekStepper />
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
  );
}
