import { Button } from "@sixthshift/design-system/button";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import type { ISOTime } from "@sixthshift/design-system/date-time";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { Textarea } from "@sixthshift/design-system/textarea";
import { TimePicker } from "@sixthshift/design-system/time-picker";
import { type FormEvent, useState } from "react";
import type { ISODate } from "../../../lib/dates";
import { toTime } from "../../../lib/journal";

/** An appointment as the form holds it: what, the day, and perhaps the time, the place and notes. */
export type AppointmentDraft = { title: string; day: ISODate | null; time: string | null; place: string; notes: string };

export const EMPTY_DRAFT: AppointmentDraft = { title: "", day: null, time: null, place: "", notes: "" };

/** What it is and its day are needed; the time, the place and notes if you have them. */
export function AppointmentForm({
  initial = EMPTY_DRAFT,
  submitLabel,
  onSave,
  onCancel,
}: {
  initial?: AppointmentDraft;
  submitLabel: string;
  onSave: (draft: AppointmentDraft & { day: ISODate }) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const set = (to: Partial<AppointmentDraft>) => setDraft((d) => ({ ...d, ...to }));
  const ready = draft.title.trim().length > 0 && draft.day !== null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || draft.day === null) return;
    onSave({ ...draft, day: draft.day });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <FormField label="What it is">
        <Input
          value={draft.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Midwife, 20-week scan, GP"
          aria-label="What it is"
          maxLength={200}
        />
      </FormField>
      <div className="flex flex-wrap gap-3">
        <FormField label="Day">
          <DatePicker
            value={draft.day ?? undefined}
            onChange={(d) => set({ day: (d as ISODate | undefined) ?? null })}
            segmentOrder="dmy"
            weekStartsOn={1}
            clearable={false}
          />
        </FormField>
        <FormField label="Time (if you know it)">
          <TimePicker value={(draft.time ?? undefined) as ISOTime | undefined} onChange={(t) => set({ time: toTime(t) })} clockFormat="12h" />
        </FormField>
      </div>
      <FormField label="Where (if you want)">
        <Input
          value={draft.place}
          onChange={(e) => set({ place: e.target.value })}
          placeholder="The hospital's antenatal clinic"
          aria-label="Where"
          maxLength={500}
        />
      </FormField>
      <FormField label="Notes (if you want)">
        <Textarea
          value={draft.notes}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="Bring the referral. Fast from midnight."
          aria-label="Notes"
          autosize
          rows={2}
          maxLength={10_000}
        />
      </FormField>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" intent="brand" disabled={!ready}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
