// Sickness and cravings in the Journal: being sick, a craving, or something
// gone off, kept by either of you in a tap or two. Shown back so you can
// answer the midwife's "since when?" (the weeks as rows of days), and for fun
// later (what you craved, how often). Never a score and never advice about
// her body: can't keep fluids down is a call, as `severe-vomiting` says, and
// craving things that aren't food is worth mentioning, as
// `food-cravings-and-aversions` says. See docs/product/journal.md.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Input } from "@sixthshift/design-system/input";
import { toast } from "@sixthshift/design-system/overlay";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { appetiteSaves } from "../../../../../api/rpc/appetite";
import { usePeople } from "../../../../../api/rpc/people";
import { useSave } from "../../../../../app/hooks/useSave";
import { type AppetiteEntry, type AppetiteKind, describe, type How, inputOf } from "../../../../../lib/appetite";
import type { ISODate } from "../../../../../lib/dates";
import { when } from "../../../model/dates";
import { HowPicker, KIND_OPTIONS, WhenFields } from "./AppetiteFields";
import { TooSick } from "./TooSick";

/** Changing an entry: how bad, or what, a few words, and when. */
function EntryForm({ entry, onSave, onCancel }: { entry: AppetiteEntry; onSave: (changed: AppetiteEntry) => void; onCancel: () => void }) {
  const [how, setHow] = useState<How>(entry.how ?? "queasy");
  const [kind, setKind] = useState<AppetiteKind>(entry.kind);
  const [what, setWhat] = useState(entry.what ?? "");
  const [note, setNote] = useState(entry.note ?? "");
  const [day, setDay] = useState<ISODate>(entry.day as ISODate);
  const [time, setTime] = useState(entry.time ?? "12:00");
  const sick = kind === "sick";

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!sick && what.trim().length === 0) return;
        onSave({ ...entry, kind, day, time, how: sick ? how : null, what: sick ? null : what, note: note.trim() || null });
      }}
    >
      {sick ? (
        <HowPicker value={how} onChoose={setHow} />
      ) : (
        <>
          <ToggleGroup
            type="single"
            appearance="segmented"
            size="sm"
            variant="outline"
            intent="brand"
            aria-label="Craving or gone off"
            className="self-start"
            value={kind}
            onValueChange={(value) => setKind(value as AppetiteKind)}
            options={KIND_OPTIONS}
          />
          <Input value={what} onChange={(e) => setWhat(e.target.value)} aria-label="What" maxLength={200} />
        </>
      )}
      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A few words, if you want" aria-label="About it" maxLength={10_000} />
      <WhenFields day={day} time={time} onDay={setDay} onTime={setTime} />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" intent="brand" size="sm" disabled={!sick && what.trim().length === 0}>
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** One kept: what it was, its words, who kept it and when; changed or deleted by either of you. */
export function AppetiteItem({ entry }: { entry: AppetiteEntry }) {
  const [editing, setEditing] = useState(false);
  // Changed to can't keep fluids down: the call, as when it's first kept, until put away.
  const [tooSick, setTooSick] = useState(false);
  const edit = useSave(appetiteSaves.editAppetite);
  const remove = useSave(appetiteSaves.deleteAppetite);
  const restore = useSave(appetiteSaves.restoreAppetite);
  const { data: people } = usePeople();
  const name = (id: string | null) => (id === null ? null : id === people.me?.id ? "You" : (people.people.find((p) => p.id === id)?.name ?? null));

  function deleteIt() {
    remove({ id: entry.id });
    toast({ title: "Deleted", action: "Undo", onAction: () => restore(entry) });
  }

  if (editing) {
    return (
      <Card size="sm">
        <EntryForm
          entry={entry}
          onSave={(changed) => {
            edit(inputOf(changed));
            setEditing(false);
            if (changed.how === "fluids" && entry.how !== "fluids") setTooSick(true);
          }}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  if (tooSick) {
    return (
      <div className="flex flex-col gap-3">
        <TooSick />
        <Button variant="outline" onClick={() => setTooSick(false)}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <Card size="sm">
      <p className="font-medium text-fg-strong">{describe(entry)}</p>
      {entry.note ? <p className="mt-1 whitespace-pre-wrap">{entry.note}</p> : null}
      <div className="mt-2 flex items-center gap-1 text-xs text-fg-subtle">
        <span className="flex-1">{[name(entry.by), when(entry.day, entry.time)].filter(Boolean).join(" · ")}</span>
        <Button variant="ghost" size="sm" iconOnly aria-label="Change this" onClick={() => setEditing(true)}>
          <Pencil aria-hidden size={16} />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Delete this" onClick={deleteIt}>
          <Trash2 aria-hidden size={16} />
        </Button>
      </div>
    </Card>
  );
}
