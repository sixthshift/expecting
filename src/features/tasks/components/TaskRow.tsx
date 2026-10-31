import { Checkbox } from "@sixthshift/design-system/checkbox";
import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";
import { checklistSaves } from "../../../api/rpc/checklist";
import { useSave } from "../../../app/hooks/useSave";
import { feelDone } from "../../../app/model/feel";
import type { Task } from "../../../content/schema";
import { KeepButton } from "./KeepButton";

/**
 * One task with its tick. The tick shows at once, everywhere the task
 * appears, and is saved behind it, whenever there's a connection; one the
 * server turns away is put back. A task that keeps something offers the way
 * to keep it until it's ticked (KeepButton), before any `action`.
 *
 * Where a ticked task leaves its list (To do now), the list keeps it a moment
 * as `leaving`: ticked and struck through, then folding away, so the rows
 * under it close up rather than jump.
 */
export function TaskRow({
  task,
  ticked,
  meta,
  action,
  stack = false,
  leaving = false,
  onTick,
}: {
  task: Task;
  ticked: boolean;
  meta?: ReactNode;
  action?: ReactNode;
  /** On a phone, put the meta and action on their own line under the title, for a long one. */
  stack?: boolean;
  /** Ticked, and on its way out of this list: shown a beat, then folded away. */
  leaving?: boolean;
  /** Told of each tick or untick as it is made, before it is saved. */
  onTick?: (ticked: boolean) => void;
}) {
  const save = useSave(checklistSaves.setTicked);

  function change(next: boolean) {
    if (next) feelDone();
    onTick?.(next);
    save({ taskId: task.id, ticked: next });
  }

  const keep = task.keeps && !ticked ? <KeepButton keeps={task.keeps} onKept={() => change(true)} /> : null;
  const actions =
    keep && action ? (
      <>
        {keep}
        {action}
      </>
    ) : (
      (keep ?? action)
    );

  const row = (
    <div className={stack ? "flex min-h-11 flex-wrap items-center gap-x-3 pb-2 lg:flex-nowrap lg:pb-0" : "flex min-h-11 items-center gap-3"}>
      <Checkbox
        checked={ticked}
        onCheckedChange={change}
        label={
          <span className={cn("transition-colors duration-(--motion-base)", ticked && "text-fg-subtle line-through decoration-fg-subtle")}>{task.title}</span>
        }
        labelClassName="flex-1 min-h-11 items-center"
        className="shrink-0"
      />
      {stack ? (
        <span className="flex basis-full items-center gap-3 pl-9 text-xs text-fg-subtle lg:ml-auto lg:basis-auto lg:shrink-0 lg:pl-0">
          {meta}
          {actions}
        </span>
      ) : (
        <>
          {meta ? <span className="ml-auto shrink-0 text-xs text-fg-subtle">{meta}</span> : null}
          {actions}
        </>
      )}
    </div>
  );

  // Folded with the grid trick (a row of 1fr to 0fr), so the rows under it close up smoothly whatever its height.
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-(--motion-base) ease-(--ease-exit)",
        leaving ? "grid-rows-[0fr] opacity-0 delay-500" : "grid-rows-[1fr]"
      )}
    >
      <div className={cn("min-h-0", leaving && "overflow-hidden")}>{row}</div>
    </div>
  );
}
