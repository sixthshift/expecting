import { Checkbox } from "@sixthshift/design-system/checkbox";
import { type ReactNode, useState } from "react";
import { setTicked } from "../../api/rpc/checklist";
import type { Task } from "../../content/schema";
import { useAction } from "../household/useAction";

/**
 * One task with its tick. The tick shows at once and is saved behind it; a
 * failed save puts it back. Ticking here ticks it everywhere it appears.
 */
export function TaskRow({
  task,
  ticked,
  meta,
  action,
  onTick,
}: {
  task: Task;
  ticked: boolean;
  meta?: ReactNode;
  action?: ReactNode;
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
    <div className="flex min-h-11 items-center gap-3">
      <Checkbox
        checked={checked}
        onCheckedChange={change}
        label={<span className={checked ? "text-fg-subtle line-through" : undefined}>{task.title}</span>}
        labelClassName="flex-1 min-h-11 items-center"
        className="shrink-0"
      />
      {meta ? <span className="ml-auto shrink-0 text-xs text-fg-subtle">{meta}</span> : null}
      {action}
    </div>
  );
}
