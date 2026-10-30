import { Checkbox } from "@sixthshift/design-system/checkbox";
import { type ReactNode, useState } from "react";
import { setTicked } from "../../../api/rpc/checklist";
import { useAction } from "../../../app/hooks/useAction";
import type { Task } from "../../../content/schema";

/**
 * One task with its tick. The tick shows at once and is saved behind it; a
 * failed save puts it back. Ticking here ticks it everywhere it appears.
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
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const checked = optimistic ?? ticked;
  const [save] = useAction((next: boolean) => setTicked({ data: { taskId: task.id, ticked: next } }));

  async function change(next: boolean) {
    setOptimistic(next);
    onTick?.(next);
    try {
      await save(next);
    } finally {
      setOptimistic(null);
    }
  }

  return (
    <div className={stack ? "flex min-h-11 flex-wrap items-center gap-x-3 pb-2 lg:flex-nowrap lg:pb-0" : "flex min-h-11 items-center gap-3"}>
      <Checkbox
        checked={checked}
        onCheckedChange={change}
        label={<span className={checked ? "text-fg-subtle line-through" : undefined}>{task.title}</span>}
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
