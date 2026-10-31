// Movements in the Journal: when you felt the baby move, so you get to know
// their own pattern. Australian advice is to know the pattern, not to count
// kicks, so nothing here counts, scores or reassures. A movement felt as
// slower, weaker or stopped leads straight to the call, as `baby-movements`
// says: straight away, not tomorrow.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { toast } from "@sixthshift/design-system/overlay";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { journalSaves } from "../../../../../api/rpc/journal";
import { usePeople } from "../../../../../api/rpc/people";
import { useSave } from "../../../../../app/hooks/useSave";
import type { ISODate } from "../../../../../lib/dates";
import type { JournalEntry } from "../../../../../lib/journal";
import { when } from "../../../model/dates";
import { MovementForm } from "./MovementForm";
import { MovementsChanged } from "./MovementsChanged";

/** A movement: when, its words if any, whether it felt different, and who felt it. */
export function Movement({ entry }: { entry: JournalEntry }) {
  const [editing, setEditing] = useState(false);
  // Changed to slower, weaker or stopped: the call, as when it's first kept, until put away.
  const [changed, setChanged] = useState(false);
  const edit = useSave(journalSaves.editMovement);
  const remove = useSave(journalSaves.deleteMovement);
  const restore = useSave(journalSaves.restoreMovement);
  const { data: people } = usePeople();
  const name = (id: string | null) => (id === null ? null : id === people.me?.id ? "You" : (people.people.find((p) => p.id === id)?.name ?? null));
  const time = entry.time ?? "00:00";

  function deleteIt() {
    remove({ id: entry.id });
    toast({ title: "Movement deleted", action: "Undo", onAction: () => restore({ ...entry, time }) });
  }

  if (editing) {
    return (
      <Card size="sm">
        <MovementForm
          initial={{ day: entry.day as ISODate, time, body: entry.body, different: entry.different }}
          submitLabel="Save"
          onSave={(draft) => {
            edit({ id: entry.id, ...draft });
            setEditing(false);
            if (draft.different && !entry.different) setChanged(true);
          }}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  if (changed) {
    return (
      <div className="flex flex-col gap-3">
        <MovementsChanged />
        <Button variant="outline" onClick={() => setChanged(false)}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <Card size="sm">
      <p className="font-medium text-fg-strong">
        The baby moved
        {entry.different ? <span className="font-normal text-fg-normal"> · slower, weaker or stopped</span> : null}
      </p>
      {entry.body ? <p className="mt-1 whitespace-pre-wrap">{entry.body}</p> : null}
      <div className="mt-2 flex items-center gap-1 text-xs text-fg-subtle">
        <span className="flex-1">{[name(entry.by), when(entry.day, entry.time)].filter(Boolean).join(" · ")}</span>
        <Button variant="ghost" size="sm" iconOnly aria-label="Change this movement" onClick={() => setEditing(true)}>
          <Pencil aria-hidden size={16} />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Delete this movement" onClick={deleteIt}>
          <Trash2 aria-hidden size={16} />
        </Button>
      </div>
    </Card>
  );
}
