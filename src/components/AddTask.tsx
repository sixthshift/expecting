import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { useRouter } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { Task } from "../content/schema";
import { type Slot, slotLabel } from "../lib/timeline";
import { addOwnTask, deleteOwnTask } from "../server/functions/checklist";

/** A task of our own, added straight into the week it belongs to. */
export function AddTask({ slot }: { slot: Slot }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim().length === 0) return;
    setSaving(true);
    try {
      const data = slot.phase === "before" ? { title, phase: slot.phase, week: null } : { title, phase: slot.phase, week: slot.week };
      await addOwnTask({ data });
      setTitle("");
      await router.invalidate();
    } finally {
      setSaving(false);
    }
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
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={`Delete "${task.title}"`}
      onClick={async () => {
        await deleteOwnTask({ data: { id: task.id } });
        await router.invalidate();
      }}
    >
      <Trash2 aria-hidden size={16} />
    </Button>
  );
}
