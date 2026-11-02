import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { type FormEvent, useState } from "react";
import { itsTimeSaves } from "../../../../../api/rpc/itsTime";
import { WORDS_MAX } from "../../../../../lib/itsTime";
import { newId } from "../../../../../lib/outbox";
import { useSave } from "../../../../hooks/useSave";

/** A last thing of your own ("Turn the heater off"), kept for every start. */
export function AddOwn() {
  const add = useSave(itsTimeSaves.addStartLine);
  const [title, setTitle] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    add({ id: newId(), title });
    setTitle("");
  }
  return (
    <form onSubmit={submit} className="flex gap-2 py-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={WORDS_MAX}
        placeholder="Add one: turn the heater off"
        aria-label="A last thing of your own"
        className="flex-1"
      />
      <Button type="submit" variant="outline" size="sm">
        Add
      </Button>
    </form>
  );
}
