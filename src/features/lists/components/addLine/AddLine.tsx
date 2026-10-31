import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { listsSaves } from "../../../../api/rpc/lists";
import { useSave } from "../../../../app/hooks/useSave";
import { newId } from "../../../../lib/outbox";

/** A line of your own on a list, for what Expecting couldn't know. */
export function AddLine({ listId }: { listId: string }) {
  const [title, setTitle] = useState("");
  const add = useSave(listsSaves.addLine);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim().length === 0) return;
    add({ id: newId(), listId, title, section: null });
    setTitle("");
  }

  return (
    <form onSubmit={submit} className="flex max-w-xl gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add something…"
        aria-label="Something to add"
        maxLength={200}
        className="flex-1"
      />
      <Button type="submit" variant="outline" iconOnly aria-label="Add it" disabled={title.trim().length === 0}>
        <Plus aria-hidden size={16} />
      </Button>
    </form>
  );
}
