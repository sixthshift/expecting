import { Button } from "@sixthshift/design-system/button";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import { FormField } from "@sixthshift/design-system/form-field";
import { type FormEvent, useState } from "react";
import type { ISODate } from "../lib/dates";

type Props = {
  label: string;
  description?: string;
  value: ISODate | null;
  submitLabel: string;
  onSave: (date: ISODate | null) => Promise<unknown>;
  /** Whether saving with no date (clearing it) is allowed. */
  clearable?: boolean;
  minDate?: ISODate;
  maxDate?: ISODate;
  /** A full-width, large button: the main action of a screen, as in onboarding. */
  wide?: boolean;
  /** Whether the date must change before it can be saved. Off where the button goes on, not only saves (onboarding's Next, come back to). */
  requireChange?: boolean;
};

/** One date, picked day-first, saved with a button. */
export function DateForm({ label, description, value, submitLabel, onSave, clearable = false, minDate, maxDate, wide = false, requireChange = true }: Props) {
  const [date, setDate] = useState<ISODate | undefined>(value ?? undefined);
  const [saving, setSaving] = useState(false);
  const unchanged = requireChange && (date ?? null) === value;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(date ?? null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <FormField label={label} description={description}>
        <DatePicker
          value={date}
          onChange={(d) => setDate(d as ISODate | undefined)}
          segmentOrder="dmy"
          weekStartsOn={1}
          clearable={clearable}
          minDate={minDate}
          maxDate={maxDate}
        />
      </FormField>
      <Button
        type="submit"
        intent="brand"
        size={wide ? "xl" : "md"}
        loading={saving}
        disabled={unchanged || (!clearable && !date)}
        className={wide ? "w-full" : "self-start"}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
