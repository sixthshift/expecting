// Notes in the Journal: anything worth remembering, from either of you, on
// its day, or a letter to the baby. Shared, and either of you can change one;
// each says who wrote it and who changed it last.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import type { ISOTime } from "@sixthshift/design-system/date-time";
import { FormField } from "@sixthshift/design-system/form-field";
import { toast } from "@sixthshift/design-system/overlay";
import { Textarea } from "@sixthshift/design-system/textarea";
import { TimePicker } from "@sixthshift/design-system/time-picker";
import { Pencil, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { journalSaves } from "../../../../api/rpc/journal";
import { usePeople } from "../../../../api/rpc/people";
import { useSave } from "../../../../app/hooks/useSave";
import { formatDate, type ISODate, todayISO } from "../../../../lib/dates";
import { formatTime, type JournalEntry, timeNow, toTime } from "../../../../lib/journal";
import { newId } from "../../../../lib/outbox";

type Draft = { day: ISODate; time: string | null; body: string; letter: boolean };

/** "Today, 2:15 pm", "Tue 27 Oct, 2:15 pm". */
export function when(day: string, time: string | null, today: ISODate = todayISO()): string {
  const date =
    day === today
      ? "Today"
      : formatDate(day as ISODate, { weekday: "short", day: "numeric", month: "short", ...(day.slice(0, 4) === today.slice(0, 4) ? {} : { year: "numeric" }) });
  return time ? `${date}, ${formatTime(time)}` : date;
}

/** A note's words, and its day and time, kept folded as "Today, now" until changed. */
function NoteForm({ initial, submitLabel, onSave, onCancel }: { initial?: Draft; submitLabel: string; onSave: (draft: Draft) => void; onCancel?: () => void }) {
  const [body, setBody] = useState(initial?.body ?? "");
  const [letter, setLetter] = useState(initial?.letter ?? false);
  // A new note is now unless its day or time is changed; it's "now" as it's saved, not as the form opened.
  const [day, setDay] = useState<ISODate | null>(initial?.day ?? null);
  const [time, setTime] = useState<string | null>(initial ? initial.time : null);
  const [choosing, setChoosing] = useState(Boolean(initial));
  const today = todayISO();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (body.trim().length === 0) return;
    onSave(choosing ? { day: day ?? today, time, body, letter } : { day: today, time: timeNow(), body, letter });
    if (!initial) {
      setBody("");
      setLetter(false);
      setChoosing(false);
      setDay(null);
      setTime(null);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={letter ? "Dear you…" : "What happened?"}
        aria-label={initial ? "Note" : "New note"}
        autosize
        rows={initial ? 3 : 2}
        maxLength={10_000}
      />
      <Checkbox checked={letter} onCheckedChange={setLetter} label="A letter to the baby" />
      {choosing ? (
        <div className="flex flex-wrap gap-3">
          <FormField label="Day">
            <DatePicker
              value={day ?? today}
              onChange={(d) => setDay((d as ISODate | undefined) ?? null)}
              segmentOrder="dmy"
              weekStartsOn={1}
              clearable={false}
              maxDate={today}
            />
          </FormField>
          <FormField label="Time (if it matters)">
            <TimePicker value={(time ?? undefined) as ISOTime | undefined} onChange={(t) => setTime(toTime(t))} clockFormat="12h" />
          </FormField>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" intent="brand" size={initial ? "sm" : "md"} disabled={body.trim().length === 0}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        {!choosing ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => setChoosing(true)}>
            Today, now · Change
          </Button>
        ) : null}
      </div>
    </form>
  );
}

/** A new note: today, now, unless you say otherwise. Both of you see it. `onAdded` once it's kept (the capture sheet closes). */
export function AddNote({ onAdded }: { onAdded?: (id: string) => void }) {
  const add = useSave(journalSaves.addNote);
  return (
    <div className="flex flex-col gap-2">
      <NoteForm
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
