import { Button } from "@sixthshift/design-system/button";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import type { ISOTime } from "@sixthshift/design-system/date-time";
import { FormField } from "@sixthshift/design-system/form-field";
import { Textarea } from "@sixthshift/design-system/textarea";
import { TimePicker } from "@sixthshift/design-system/time-picker";
import { type FormEvent, useState } from "react";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { type ISODate, todayISO } from "../../../../../lib/dates";
import { timeNow, toTime } from "../../../../../lib/journal";

type Draft = { day: ISODate; time: string | null; body: string; letter: boolean; fromBoth: boolean };

/** A note's words, and its day and time, kept folded as "Today, now" until changed. A letter can be from both of you, once there are two. `start`: a new note's words to begin with. `letter`: a new note starts as a letter to the baby. */
export function NoteForm({
  initial,
  start,
  letter: startLetter = false,
  submitLabel,
  onSave,
  onCancel,
}: {
  initial?: Draft;
  start?: string;
  letter?: boolean;
  submitLabel: string;
  onSave: (draft: Draft) => void;
  onCancel?: () => void;
}) {
  const [body, setBody] = useState(initial?.body ?? start?.slice(0, 10_000) ?? "");
  const [letter, setLetter] = useState(initial?.letter ?? startLetter);
  const [fromBoth, setFromBoth] = useState(initial?.fromBoth ?? false);
  const { data: people } = usePeopleQuery();
  const two = people.people.length > 1;
  // A new note is now unless its day or time is changed; it's "now" as it's saved, not as the form opened.
  const [day, setDay] = useState<ISODate | null>(initial?.day ?? null);
  const [time, setTime] = useState<string | null>(initial ? initial.time : null);
  const [choosing, setChoosing] = useState(Boolean(initial));
  const today = todayISO();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (body.trim().length === 0) return;
    const both = letter && fromBoth;
    onSave(choosing ? { day: day ?? today, time, body, letter, fromBoth: both } : { day: today, time: timeNow(), body, letter, fromBoth: both });
    if (!initial) {
      setBody("");
      setLetter(false);
      setFromBoth(false);
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
      {letter && (two || fromBoth) ? <Checkbox checked={fromBoth} onCheckedChange={setFromBoth} label="From both of us" /> : null}
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
