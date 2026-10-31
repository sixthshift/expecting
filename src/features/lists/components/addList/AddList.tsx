import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { listsSaves } from "../../../../api/rpc/lists";
import { useSave } from "../../../../app/hooks/useSave";
import { newId } from "../../../../lib/outbox";

/** A list of your own, named, then opened to fill in. */
export function AddList() {
  const [title, setTitle] = useState("");
  const add = useSave(listsSaves.addList);
  const navigate = useNavigate();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim().length === 0) return;
    const id = newId();
    add({ id, title });
    navigate({ to: "/planner/lists/$listId", params: { listId: id } });
  }

  return (
    <form onSubmit={submit} className="flex max-w-xl gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="A list of your own: Bunnings run, ask Mum to bring"
        aria-label="A new list's name"
        maxLength={200}
        className="flex-1"
      />
      <Button type="submit" variant="outline" disabled={title.trim().length === 0}>
        New list
      </Button>
    </form>
  );
}
