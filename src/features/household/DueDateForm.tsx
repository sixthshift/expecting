import { useState } from "react";
import { DateForm } from "../../components/DateForm";
import { addDays, type ISODate, todayISO } from "../../lib/dates";
import { dueDateBounds, TERM_DAYS } from "../../lib/timeline";

type Props = {
  value: ISODate | null;
  submitLabel: string;
  onSave: (dueDate: ISODate | null) => Promise<unknown>;
  /** A full-width, large button, as in onboarding. */
  wide?: boolean;
  /** Whether the due date must change before it can be saved. */
  requireChange?: boolean;
  description?: string;
};

/** The due date, or worked out from the first day of the last period. */
export function DueDateForm({ value, submitLabel, onSave, wide = false, requireChange = true, description }: Props) {
  const today = todayISO();
  const [fromPeriod, setFromPeriod] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {fromPeriod ? (
        <DateForm
          key="period"
          label="First day of the last period"
          description="Expecting adds 40 weeks, the way your midwife will."
          value={null}
          submitLabel={submitLabel}
          wide={wide}
          minDate={addDays(today, -7 * 44)}
          maxDate={today}
          onSave={async (lmp) => onSave(lmp ? addDays(lmp, TERM_DAYS) : null)}
        />
      ) : (
        <DateForm
          key="due"
          label="Due date"
          description={description}
          value={value}
          submitLabel={submitLabel}
          wide={wide}
          requireChange={requireChange}
          {...dueDateBounds(today)}
          onSave={onSave}
        />
      )}
      <button type="button" onClick={() => setFromPeriod((f) => !f)} className="min-h-11 self-start text-sm text-fg-subtle underline hover:text-fg-normal">
        {fromPeriod ? "I know the due date" : "Not sure? Work it out from the last period"}
      </button>
    </div>
  );
}
