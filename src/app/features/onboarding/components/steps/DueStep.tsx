import { saveSettings, useSettingsQuery } from "../../../../../api/rpc/settings";
import type { ISODate } from "../../../../../lib/dates";
import { DueDateForm } from "../../../settings/components/dueDate/DueDateForm";
import { useOnboardingPage } from "../../contexts/OnboardingPageContext";
import { OnboardingLayout } from "../OnboardingLayout";
import { SkipButton } from "../SkipButton";

/** The due date, or worked out from the last period. */
export function DueStep() {
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const { advance } = useOnboardingPage();
  const save = (date: ISODate | null) => advance(date ? () => saveSettings({ data: { dueDate: date } }) : undefined);
  return (
    <OnboardingLayout title="When's the baby due?" lead="Your best guess is fine. The dating scan may move it, and you can change it any time.">
      <div className="flex flex-col gap-4">
        <DueDateForm value={dueDate} submitLabel="Next" wide requireChange={false} onSave={save} />
        <SkipButton onClick={() => advance()} />
      </div>
    </OnboardingLayout>
  );
}
