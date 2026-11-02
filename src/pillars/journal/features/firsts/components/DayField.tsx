import { DatePicker } from "@sixthshift/design-system/date-picker";
import { FormField } from "@sixthshift/design-system/form-field";
import { type ISODate, todayISO } from "../../../../../lib/dates";

/** A day, today at the latest. */
export function DayField({ value, onChange }: { value: ISODate; onChange: (day: ISODate) => void }) {
  const today = todayISO();
  return (
    <FormField label="When">
      <DatePicker
        value={value}
        onChange={(d) => onChange((d as ISODate | undefined) ?? today)}
        segmentOrder="dmy"
        weekStartsOn={1}
        clearable={false}
        maxDate={today}
      />
    </FormField>
  );
}
