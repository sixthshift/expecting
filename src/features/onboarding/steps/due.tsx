import { useState } from "react";
import { saveHousehold } from "../../../api/rpc/household";
import { DateForm } from "../../../components/DateForm";
import { addDays, type ISODate, todayISO } from "../../../lib/dates";
import { dueDateBounds, TERM_DAYS } from "../../../lib/timeline";
import { SkipButton } from "../parts";
import type { Advance, Screen, StepContext } from "../step";

/** The due date, or worked out from the last period. */
export function dueStep({ state, advance }: StepContext): Screen {
  const { household } = state;
  return {
    title: "When's the baby due?",
    lead: "Your best guess is fine. The dating scan may move it, and you can change it any time.",
    body: <DueDate value={household.dueDate} onDone={advance} />,
  };
}

function DueDate({ value, onDone }: { value: ISODate | null; onDone: Advance }) {
  const today = todayISO();
  const [fromPeriod, setFromPeriod] = useState(false);
  const save = (dueDate: ISODate | null) => onDone(dueDate ? () => saveHousehold({ data: { dueDate } }) : undefined);

  return (
    <div className="flex flex-col gap-4">
      {fromPeriod ? (
        <DateForm
          key="period"
          label="First day of the last period"
          description="Expecting adds 40 weeks, the way your midwife will."
          value={null}
          submitLabel="Next"
          wide
          minDate={addDays(today, -7 * 44)}
          maxDate={today}
          onSave={async (lmp) => save(lmp ? addDays(lmp, TERM_DAYS) : null)}
        />
      ) : (
        <DateForm key="due" label="Due date" value={value} submitLabel="Next" wide requireChange={false} {...dueDateBounds(today)} onSave={save} />
      )}
      <button type="button" onClick={() => setFromPeriod((f) => !f)} className="min-h-11 self-start text-sm text-fg-subtle underline hover:text-fg-normal">
        {fromPeriod ? "I know the due date" : "Not sure? Work it out from the last period"}
      </button>
      <SkipButton onClick={() => onDone()} />
    </div>
  );
}
