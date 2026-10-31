import { journalSaves } from "../../../../../api/rpc/journal";
import { useSave } from "../../../../../app/hooks/useSave";
import { newId } from "../../../../../lib/outbox";
import { NoteForm } from "./NoteForm";

/** A new note: today, now, unless you say otherwise. Both of you see it. `text`: its words to start (shared from another app). `onAdded` once it's kept (the capture sheet closes). */
export function AddNote({ text, onAdded }: { text?: string; onAdded?: (id: string) => void }) {
  const add = useSave(journalSaves.addNote);
  return (
    <div className="flex flex-col gap-2">
      <NoteForm
        start={text}
        submitLabel="Keep it"
        onSave={({ letter, ...draft }) => {
          const id = newId();
          add({ id, ...draft, kind: letter ? "letter" : "note" });
          onAdded?.(id);
        }}
      />
      <p className="text-xs text-fg-subtle">You both see every note.</p>
    </div>
  );
}
