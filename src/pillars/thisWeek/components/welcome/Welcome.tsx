import { Card } from "@sixthshift/design-system/card";
import { settingsSaves } from "../../../../api/rpc/settings";
import { useSave } from "../../../../app/hooks/useSave";
import { DateForm } from "../../../../components/DateForm";
import { type ISODate, todayISO } from "../../../../lib/dates";
import { dueDateBounds } from "../../../../lib/timeline";

/** No due date yet (onboarding skipped it). Entering one places "now". */
export function Welcome() {
  const today = todayISO();
  const save = useSave(settingsSaves.saveSettings);
  return (
    <Card size="lg" className="my-6 max-w-lg">
      <DateForm
        label="When's the baby due?"
        description="Your best estimate is fine; change it after the dating scan. Every week is readable either way."
        value={null}
        submitLabel="Start"
        {...dueDateBounds(today)}
        onSave={async (dueDate: ISODate | null) => save({ dueDate })}
      />
    </Card>
  );
}
