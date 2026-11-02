import { Button } from "@sixthshift/design-system/button";
import { Trash2 } from "lucide-react";
import { checklistSaves } from "../../../../api/rpc/checklist";
import { useSave } from "../../../../app/hooks/useSave";
import type { Task } from "../../../../content/schema";

/** A task of your own's delete: gone from both phones. */
export function DeleteOwnTask({ task }: { task: Task }) {
  const remove = useSave(checklistSaves.deleteOwnTask);
  return (
    <Button variant="ghost" size="sm" iconOnly aria-label={`Delete "${task.title}"`} onClick={() => remove({ id: task.id })}>
      <Trash2 aria-hidden size={16} />
    </Button>
  );
}
