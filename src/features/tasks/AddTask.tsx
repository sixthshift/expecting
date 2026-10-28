import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { addOwnTask, deleteOwnTask } from "../../api/rpc/checklist";
import type { Task } from "../../content/schema";
import { type Week, weekLabel } from "../../lib/timeline";
import { useAction } from "../household/useAction";

/** A task of our own, for the odd thing Expecting couldn't know: added in the Planner, for this week. */
export function AddTask({ week }: { week: Week }) {
  const [title, setTitle] = useState("");
  const [add, saving] = useAction(async () => {
    await addOwnTask({ data: { title, week } });
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
        placeholder={`Add a task for ${weekLabel(week).toLowerCase()}`}
        aria-label={`New task for ${weekLabel(week)}`}
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
