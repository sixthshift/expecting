import { DatePicker } from "@sixthshift/design-system/date-picker";
import type { ISOTime } from "@sixthshift/design-system/date-time";
import { FormField } from "@sixthshift/design-system/form-field";
import { TimePicker } from "@sixthshift/design-system/time-picker";
import { cn } from "@sixthshift/design-system/utils";
import { useId } from "react";
import { HOW_LABEL, HOWS, type How } from "../../../../../lib/appetite";
import { type ISODate, todayISO } from "../../../../../lib/dates";
import { toTime } from "../../../../../lib/journal";

/** What a sickness tap says under it, so the three are told apart at 3 am. */
const HOW_HINT: Record<How, string> = { queasy: "Nausea", vomited: "Vomited", fluids: "Even water comes up" };

/** Queasy, threw up, can't keep fluids down: three large taps, worst last. */
export function HowPicker({ value, onChoose }: { value: How | null; onChoose: (how: How) => void }) {
  const name = useId();
  return (
    <fieldset className="grid grid-cols-3 gap-2">
      <legend className="sr-only">How bad?</legend>
      {HOWS.map((how) => {
        const chosen = how === value;
        return (
          <label
            key={how}
            className={cn(
              "flex min-h-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2 text-center text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-focus-ring",
              chosen ? "border-border-brand bg-bg-brand-subtle font-medium text-fg-on-brand-subtle" : "border-border-subtle text-fg-normal hover:bg-bg-subtle"
            )}
          >
            <input type="radio" name={name} value={how} checked={chosen} onChange={() => onChoose(how)} className="sr-only" />
            <span>{HOW_LABEL[how]}</span>
            <span className="text-xs font-normal text-fg-subtle">{HOW_HINT[how]}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

/** A day and a time, for one kept after the fact. */
export function WhenFields({ day, time, onDay, onTime }: { day: ISODate; time: string; onDay: (d: ISODate) => void; onTime: (t: string) => void }) {
  const today = todayISO();
  return (
    <div className="flex flex-wrap gap-3">
      <FormField label="Day">
        <DatePicker value={day} onChange={(d) => (d ? onDay(d as ISODate) : null)} segmentOrder="dmy" weekStartsOn={1} clearable={false} maxDate={today} />
      </FormField>
      <FormField label="Time">
        <TimePicker value={time as ISOTime} onChange={(t) => onTime(toTime(t) ?? time)} clockFormat="12h" />
      </FormField>
    </div>
  );
}

export const KIND_OPTIONS = [
  { value: "craving", label: "Craving" },
  { value: "off", label: "Gone off" },
];
