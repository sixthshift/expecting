import { Card } from "@sixthshift/design-system/card";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { inWeeks } from "../../../../lib/labels";
import type { Stage } from "../../../../lib/planner/plan";
import { weekLabel } from "../../../../lib/timeline";
import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { aheadWhen } from "../../model/labels";
import { StageSpan } from "./StageSpan";
import { TaskLine } from "./TaskLine";

/** How many of a stage's tasks it names while folded, before "and N more". */
const PREVIEW = 2;

/**
 * One stage ahead, folded: what it's working towards and how far off, its
 * first few tasks, and how much of it is done. Opened, all its tasks.
 */
export function StageCard({ stage }: { stage: Stage }) {
  const { now } = usePlannerPage();
  const [open, setOpen] = useState(false);
  const total = stage.ahead.length + stage.done.length;
  const left = now === null ? null : stage.end - now;
  return (
    <Card size="md" className="flex flex-col gap-2">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex min-h-11 flex-col gap-1.5 text-left">
        <span className="flex w-full items-baseline justify-between gap-3">
          <span className="font-semibold text-fg-strong">{stage.title}</span>
          <span className="shrink-0 text-xs text-fg-subtle">
            {weekLabel(stage.end)}
            {left === null ? null : ` · ${inWeeks(left)}`}
          </span>
        </span>
        <StageSpan start={stage.start} end={stage.end} now={now} />
        {open ? null : (
          <span className="flex flex-col text-sm text-fg-normal">
            {stage.ahead.slice(0, PREVIEW).map(({ task }) => (
              <span key={task.id}>{task.title}</span>
            ))}
            {stage.ahead.length > PREVIEW ? <span className="text-fg-subtle">and {stage.ahead.length - PREVIEW} more</span> : null}
          </span>
        )}
        <span className="flex w-full items-center gap-2 text-xs text-fg-subtle">
          <span aria-hidden className="flex flex-wrap gap-1">
            {Array.from({ length: total }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: the dots are a count, nothing more
              <span key={i} className={`size-2 rounded-full ${i < stage.done.length ? "bg-fg-brand" : "border border-border-normal"}`} />
            ))}
          </span>
          <span>
            {stage.done.length} of {total} done
          </span>
          <ChevronDown aria-hidden size={16} className={`ml-auto ${open ? "rotate-180 transition-transform" : "transition-transform"}`} />
        </span>
      </button>
      {open ? (
        <div className="flex flex-col">
          {stage.ahead.map((entry) => (
            <TaskLine key={entry.task.id} task={entry.task} when={<span>{aheadWhen(entry)}</span>} />
          ))}
          {stage.done.map((task) => (
            <TaskLine key={task.id} task={task} />
          ))}
        </div>
      ) : null}
      <Link
        to="/planner/weeks"
        search={{ stage: stage.end }}
        aria-label={`${stage.title}, on the chart`}
        className="-mb-2 flex min-h-11 w-fit items-center gap-1 text-xs text-fg-subtle hover:text-fg-normal"
      >
        On the chart
        <ChevronRight aria-hidden size={14} />
      </Link>
    </Card>
  );
}
