import { ProgressBar } from "@sixthshift/design-system/progress-bar";
import { useChecklistQuery } from "../../../../api/rpc/checklist";
import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { toDoSoFar } from "../../model/labels";

/** How much of To do is done, and how close the deadlines are. Nothing while there's nothing to do. */
export function ToDoProgress() {
  const { plan, now } = usePlannerPage();
  const { data: ticks } = useChecklistQuery({ select: (c) => c.ticks });
  if (plan.progress.total === 0) return null;
  const deadlines = [plan.next, ...plan.now].filter((t) => t?.why === "deadline" && !ticks[t.task.id]).length;
  return (
    <div className="flex max-w-md flex-col gap-1">
      <ProgressBar completed={plan.progress.done} total={plan.progress.total} showFraction={false} label="Done so far" />
      <p className="text-sm text-fg-subtle">
        {plan.progress.done} of {plan.progress.total} done
        {now === null ? null : toDoSoFar(deadlines, plan.next !== null)}
      </p>
    </div>
  );
}
