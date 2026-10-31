// Notes in the Journal: anything worth remembering, from either of you, on
// its day, or a letter to the baby. Shared, and either of you can change one;
// each says who wrote it and who changed it last.

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
import { NoteForm } from "./NoteForm";

/** A note (or a letter to the baby, said so): its words, then who wrote it and when, and who changed it last. */
export function Note({ entry }: { entry: JournalEntry }) {
  const [editing, setEditing] = useState(false);
  const edit = useSave(journalSaves.editNote);
  const remove = useSave(journalSaves.deleteNote);
  const restore = useSave(journalSaves.restoreNote);
  const { data: people } = usePeople();
  const name = (id: string | null) => (id === null ? null : id === people.me?.id ? "You" : (people.people.find((p) => p.id === id)?.name ?? null));
  // Changed by the one who wrote it, or by someone forgotten since: only "changed".
  const changer = entry.editedBy !== entry.by ? name(entry.editedBy) : null;
  const changed = entry.editedAt ? (changer ? `changed by ${changer === "You" ? "you" : changer}` : "changed") : null;

  function deleteIt() {
    remove({ id: entry.id });
    toast({ title: entry.kind === "letter" ? "Letter deleted" : "Note deleted", action: "Undo", onAction: () => restore(entry) });
  }

  if (editing) {
    return (
      <Card size="sm">
        <NoteForm
          initial={{ day: entry.day as ISODate, time: entry.time, body: entry.body, letter: entry.kind === "letter" }}
          submitLabel="Save"
          onSave={({ letter, ...draft }) => {
            edit({ id: entry.id, ...draft, kind: letter ? "letter" : "note" });
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card size="sm">
      {entry.kind === "letter" ? <p className="mb-1 text-xs font-semibold text-fg-brand">A letter to the baby</p> : null}
      <p className="whitespace-pre-wrap">{entry.body}</p>
      <div className="mt-2 flex items-center gap-1 text-xs text-fg-subtle">
        <span className="flex-1">{[name(entry.by), when(entry.day, entry.time), changed].filter(Boolean).join(" · ")}</span>
        <Button variant="ghost" size="sm" iconOnly aria-label="Change this note" onClick={() => setEditing(true)}>
          <Pencil aria-hidden size={16} />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Delete this note" onClick={deleteIt}>
          <Trash2 aria-hidden size={16} />
        </Button>
      </div>
    </Card>
  );
}
