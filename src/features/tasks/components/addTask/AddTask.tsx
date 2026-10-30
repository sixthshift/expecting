import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { checklistSaves } from "../../../../api/rpc/checklist";
import { useSave } from "../../../../app/hooks/useSave";
import type { Task } from "../../../../content/schema";
import { newId } from "../../../../lib/outbox";
import { type Week, weekLabel } from "../../../../lib/timeline";

/** A task of our own, for the odd thing Expecting couldn't know: added in the Planner, for this week. `onAdded` once it's kept (the capture sheet closes). */
export function AddTask({ week, onAdded }: { week: Week; onAdded?: () => void }) {
  const [title, setTitle] = useState("");
  const add = useSave(checklistSaves.addOwnTask);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim().length === 0) return;
    add({ id: newId(), title, week });
    setTitle("");
    onAdded?.();
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`Add a task for ${weekLabel(week).toLowerCase()}`}
        aria-label={`New task for ${weekLabel(week)}`}
        maxLength={200}
        className="flex-1"
      />
      <Button type="submit" variant="outline" iconOnly aria-label="Add task" disabled={title.trim().length === 0}>
        <Plus aria-hidden size={16} />
      </Button>
    </form>
  );
}

export function DeleteOwnTask({ task }: { task: Task }) {
  const remove = useSave(checklistSaves.deleteOwnTask);
  return (
    <Button variant="ghost" size="sm" iconOnly aria-label={`Delete "${task.title}"`} onClick={() => remove({ id: task.id })}>
      <Trash2 aria-hidden size={16} />
    </Button>
  );
}
