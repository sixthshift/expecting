import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { type FormEvent, useState } from "react";
import { circleSaves } from "../../../../api/rpc/circle";
import { useSave } from "../../../../app/hooks/useSave";
import { newId } from "../../../../lib/outbox";

/** Someone added by name, to every view, not yet decided in any. */
export function AddPerson() {
  const [name, setName] = useState("");
  const add = useSave(circleSaves.addCirclePerson);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length === 0) return;
    add({ id: newId(), name, note: null });
    setName("");
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add someone…" aria-label="Someone to add" maxLength={80} className="flex-1" />
      <Button type="submit" intent="brand" disabled={name.trim().length === 0}>
        Add them
      </Button>
    </form>
  );
}
