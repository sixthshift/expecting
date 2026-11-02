import type { Task } from "../../../../content/schema";
import { ItemLink } from "../../../library/components/itemLink/ItemLink";
import { DeleteOwnTask } from "../../../tasks/components/addTask/DeleteOwnTask";

/** A task's action in its row: your own one's delete, else the way to its item's why. */
export function Why({ task }: { task: Task }) {
  if (task.origin === "own") return <DeleteOwnTask task={task} />;
  if (!task.itemId) return null;
  return (
    <ItemLink itemId={task.itemId} aria-label={`Why: ${task.title}`} className="shrink-0 px-1 text-xs text-fg-subtle underline hover:text-fg-normal">
      Why
    </ItemLink>
  );
}
