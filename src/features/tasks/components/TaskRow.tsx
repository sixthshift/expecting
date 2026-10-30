import { Checkbox } from "@sixthshift/design-system/checkbox";
import type { ReactNode } from "react";
import { checklistSaves } from "../../../api/rpc/checklist";
import { useSave } from "../../../app/hooks/useSave";
import type { Task } from "../../../content/schema";

/**
 * One task with its tick. The tick shows at once, everywhere the task
 * appears, and is saved behind it, whenever there's a connection; one the
 * server turns away is put back.
 */
export function TaskRow({
  task,
  ticked,
  meta,
  action,
  stack = false,
  onTick,
}: {
  task: Task;
  ticked: boolean;
  meta?: ReactNode;
  action?: ReactNode;
  /** On a phone, put the meta and action on their own line under the title, for a long one. */
  stack?: boolean;
  /** Told of each tick or untick as it is made, before it is saved. */
  onTick?: (ticked: boolean) => void;
}) {
  const save = useSave(checklistSaves.setTicked);

  function change(next: boolean) {
    onTick?.(next);
    save({ taskId: task.id, ticked: next });
  }

  return (
    <div className={stack ? "flex min-h-11 flex-wrap items-center gap-x-3 pb-2 lg:flex-nowrap lg:pb-0" : "flex min-h-11 items-center gap-3"}>
      <Checkbox
        checked={ticked}
        onCheckedChange={change}
        label={<span className={ticked ? "text-fg-subtle line-through" : undefined}>{task.title}</span>}
        labelClassName="flex-1 min-h-11 items-center"
        className="shrink-0"
      />
      {stack ? (
        <span className="flex basis-full items-center gap-3 pl-9 text-xs text-fg-subtle lg:ml-auto lg:basis-auto lg:shrink-0 lg:pl-0">
          {meta}
          {action}
        </span>
      ) : (
        <>
          {meta ? <span className="ml-auto shrink-0 text-xs text-fg-subtle">{meta}</span> : null}
          {action}
        </>
      )}
    </div>
  );
}
