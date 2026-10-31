import { Button } from "@sixthshift/design-system/button";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import type { ISOTime } from "@sixthshift/design-system/date-time";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { TimePicker } from "@sixthshift/design-system/time-picker";
import { type FormEvent, useState } from "react";
import { type ISODate, todayISO } from "../../../../../lib/dates";
import { timeNow, toTime } from "../../../../../lib/journal";

type Draft = { day: ISODate; time: string; body: string; different: boolean };

/** A movement: now unless you say otherwise, a few words if you want, and whether it felt different. */
export function MovementForm({
  initial,
  submitLabel,
  onSave,
  onCancel,
}: {
  initial?: Draft;
  submitLabel: string;
  onSave: (draft: Draft) => void;
  onCancel?: () => void;
}) {
  const [body, setBody] = useState(initial?.body ?? "");
  const [different, setDifferent] = useState(initial?.different ?? false);
  // A new movement is now unless its day or time is changed; it's "now" as it's kept, not as the form opened.
  const [day, setDay] = useState<ISODate | null>(initial?.day ?? null);
  const [time, setTime] = useState<string | null>(initial?.time ?? null);
  const [choosing, setChoosing] = useState(Boolean(initial));
  const today = todayISO();

  function submit(event: FormEvent) {
    event.preventDefault();
    onSave({ day: choosing ? (day ?? today) : today, time: choosing ? (time ?? timeNow()) : timeNow(), body, different });
    if (!initial) {
      setBody("");
      setDifferent(false);
      setChoosing(false);
      setDay(null);
      setTime(null);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="A few words, if you want" aria-label="About the movement" maxLength={10_000} />
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
          <FormField label="Time">
            <TimePicker value={(time ?? undefined) as ISOTime | undefined} onChange={(t) => setTime(toTime(t))} clockFormat="12h" />
          </FormField>
        </div>
      ) : null}
      <Checkbox checked={different} onCheckedChange={setDifferent} label="Slower, weaker or stopped?" />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" intent="brand" size={initial ? "sm" : "md"}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        {!choosing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setDay(today);
              setTime(timeNow());
              setChoosing(true);
            }}
          >
            Today, now · Change
          </Button>
        ) : null}
      </div>
    </form>
  );
}
