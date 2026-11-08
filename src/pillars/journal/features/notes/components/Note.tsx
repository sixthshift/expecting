// Notes in the Journal: anything worth remembering, from either of you, on
// its day, or a letter to the baby (from one of you, or both). Shared, and
// either of you can change one; each says who wrote it and who changed it last.

import { Card } from "@sixthshift/design-system/card";
import { toast } from "@sixthshift/design-system/overlay";
import { useState } from "react";
import { journalSaves } from "../../../../../api/rpc/journal";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { useSave } from "../../../../../app/hooks/useSave";
import type { ISODate } from "../../../../../lib/dates";
import type { JournalEntry } from "../../../../../lib/journal/journal";
import { when } from "../../../../../lib/labels";
import { nameBy } from "../../../../../lib/people";
import { KeptCard } from "../../../components/KeptCard";
import { changedBy } from "../../../model/labels";
import { NoteForm } from "./NoteForm";

/** A note (or a letter to the baby, said so): its words, then who wrote it and when, and who changed it last. */
export function Note({ entry }: { entry: JournalEntry }) {
  const [editing, setEditing] = useState(false);
  const edit = useSave(journalSaves.editNote);
  const remove = useSave(journalSaves.deleteNote);
  const restore = useSave(journalSaves.restoreNote);
  const { data: people } = usePeopleQuery();
  const name = (id: string | null) => nameBy(id, people.me, people.people);
  // A letter from both is signed by both, whoever kept it.
  const signed = entry.kind === "letter" && entry.fromBoth ? "From both of you" : name(entry.by);

  function deleteIt() {
    remove({ id: entry.id });
    toast({ title: entry.kind === "letter" ? "Letter deleted" : "Note deleted", action: "Undo", onAction: () => restore(entry) });
  }

  if (editing) {
    return (
      <Card size="sm">
        <NoteForm
          initial={{ day: entry.day as ISODate, time: entry.time, body: entry.body, letter: entry.kind === "letter", fromBoth: entry.fromBoth }}
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
    <KeptCard
      what="this note"
      meta={[signed, when(entry.day, entry.time), changedBy(entry, people.me, people.people)].filter(Boolean).join(" · ")}
      onChange={() => setEditing(true)}
      onDelete={deleteIt}
    >
      {entry.kind === "letter" ? <p className="mb-1 text-xs font-semibold text-fg-brand">A letter to the baby</p> : null}
      <p className="whitespace-pre-wrap">{entry.body}</p>
    </KeptCard>
  );
}
