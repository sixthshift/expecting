import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useAction } from "../app/useAction";
import type { Task } from "../content/schema";
import { type Slot, slotLabel } from "../lib/timeline";
import { addOwnTask, deleteOwnTask } from "../server/functions/checklist";

/** A task of our own, added straight into the week it belongs to. */
export function AddTask({ slot }: { slot: Slot }) {
  const [title, setTitle] = useState("");
  const [add, saving] = useAction(async () => {
    const data = slot.phase === "before" ? { title, phase: slot.phase, week: null } : { title, phase: slot.phase, week: slot.week };
    await addOwnTask({ data });
    setTitle("");
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim().length > 0) await add();
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`Add a task for ${slotLabel(slot).toLowerCase()}`}
        aria-label={`New task for ${slotLabel(slot)}`}
        maxLength={200}
        className="flex-1"
      />
      <Button type="submit" variant="outline" iconOnly aria-label="Add task" loading={saving} disabled={title.trim().length === 0}>
        <Plus aria-hidden size={16} />
      </Button>
    </form>
  );
}

export function DeleteOwnTask({ task }: { task: Task }) {
  const [remove, removing] = useAction(() => deleteOwnTask({ data: { id: task.id } }));
  return (
    <Button variant="ghost" size="sm" iconOnly aria-label={`Delete "${task.title}"`} loading={removing} onClick={remove}>
      <Trash2 aria-hidden size={16} />
    </Button>
  );
}
