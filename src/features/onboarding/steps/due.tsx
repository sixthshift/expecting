import { saveHousehold } from "../../../api/rpc/household";
import type { ISODate } from "../../../lib/dates";
import { DueDateForm } from "../../household/DueDateForm";
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
  const save = (dueDate: ISODate | null) => onDone(dueDate ? () => saveHousehold({ data: { dueDate } }) : undefined);
  return (
    <div className="flex flex-col gap-4">
      <DueDateForm value={value} submitLabel="Next" wide requireChange={false} onSave={save} />
      <SkipButton onClick={() => onDone()} />
    </div>
  );
}
