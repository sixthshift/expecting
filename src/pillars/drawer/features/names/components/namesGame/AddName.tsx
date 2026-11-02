import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { namesSaves } from "../../../../../../api/rpc/names";
import { useSave } from "../../../../../../app/hooks/useSave";
import { newId } from "../../../../../../lib/outbox";

/** A name you like, added to the deck: adding it likes it. */
export function AddName() {
  const [name, setName] = useState("");
  const add = useSave(namesSaves.addName);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length === 0) return;
    add({ id: newId(), name });
    setName("");
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add a name you like"
        aria-label="A name to add"
        maxLength={60}
        className="flex-1"
      />
      <Button type="submit" variant="outline" iconOnly aria-label="Add name" disabled={name.trim().length === 0}>
        <Plus aria-hidden size={16} />
      </Button>
    </form>
  );
}
