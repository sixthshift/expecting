// When something was, for one kept after the fact: a day, today at the
// latest, and a time. The same fields for every kind kept.

import { DatePicker } from "@sixthshift/design-system/date-picker";
import type { ISOTime } from "@sixthshift/design-system/date-time";
import { FormField } from "@sixthshift/design-system/form-field";
import { TimePicker } from "@sixthshift/design-system/time-picker";
import { type ISODate, todayISO, toTime } from "../../../lib/dates";

/** A day, today at the latest. */
export function DayField({ label = "Day", value, onChange }: { label?: string; value: ISODate; onChange: (day: ISODate) => void }) {
  const today = todayISO();
  return (
    <FormField label={label}>
      <DatePicker value={value} onChange={(d) => (d ? onChange(d as ISODate) : null)} segmentOrder="dmy" weekStartsOn={1} clearable={false} maxDate={today} />
    </FormField>
  );
}

/** A day and a time; the time cleared is null. */
export function WhenFields({
  day,
  time,
  onDay,
  onTime,
  timeLabel = "Time",
}: {
  day: ISODate;
  time: string | null;
  onDay: (day: ISODate) => void;
  onTime: (time: string | null) => void;
  timeLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <DayField value={day} onChange={onDay} />
      <FormField label={timeLabel}>
        <TimePicker value={(time ?? undefined) as ISOTime | undefined} onChange={(t) => onTime(toTime(t))} clockFormat="12h" />
      </FormField>
    </div>
  );
}
