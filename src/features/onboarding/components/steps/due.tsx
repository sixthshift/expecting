import { saveSettings } from "../../../../api/rpc/settings";
import type { ISODate } from "../../../../lib/dates";
import { DueDateForm } from "../../../settings/components/dueDate/DueDateForm";
import type { Advance, Screen, StepContext } from "../../model/step";
import { SkipButton } from "../parts";

/** The due date, or worked out from the last period. */
export function dueStep({ settings, advance }: StepContext): Screen {
  return {
    title: "When's the baby due?",
    lead: "Your best guess is fine. The dating scan may move it, and you can change it any time.",
    body: <DueDate value={settings.dueDate} onDone={advance} />,
  };
}

function DueDate({ value, onDone }: { value: ISODate | null; onDone: Advance }) {
  const save = (dueDate: ISODate | null) => onDone(dueDate ? () => saveSettings({ data: { dueDate } }) : undefined);
  return (
    <div className="flex flex-col gap-4">
      <DueDateForm value={value} submitLabel="Next" wide requireChange={false} onSave={save} />
      <SkipButton onClick={() => onDone()} />
    </div>
  );
}
