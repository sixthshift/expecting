import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { listsSaves } from "../../../../../../api/rpc/lists";
import { useSave } from "../../../../../../app/hooks/useSave";

/** A list of your own's name, renamed in place, and deleted after asking: its lines go with it. */
export function OwnName({ id, title }: { id: string; title: string }) {
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState(title);
  const rename = useSave(listsSaves.renameList);
  const remove = useSave(listsSaves.deleteList);
  const navigate = useNavigate();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length > 0 && name.trim() !== title) rename({ id, title: name });
    setRenaming(false);
  }

  function deleteIt() {
    remove({ id });
    navigate({ to: "/planner/lists" });
  }

  return (
    <div className="flex flex-col gap-1">
      {renaming ? (
        <form onSubmit={submit} className="flex max-w-xl gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="The list's name" maxLength={200} className="flex-1" autoFocus />
          <Button type="submit" intent="brand" size="sm">
            Save
          </Button>
        </form>
      ) : (
        <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">{title}</h1>
      )}
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-fg-normal">Delete this list and everything on it, from both phones?</span>
          <Button intent="danger" size="sm" onClick={deleteIt}>
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            Keep it
          </Button>
        </div>
      ) : renaming ? null : (
        <div className="-ml-3 flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setRenaming(true)}>
            Rename
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            Delete list
          </Button>
        </div>
      )}
    </div>
  );
}
