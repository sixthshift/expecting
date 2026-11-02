import { Button } from "@sixthshift/design-system/button";
import { ProgressBar } from "../../../../components/ProgressBar";
import { useSettingsPage } from "../../contexts/SettingsPageContext";

/** How many questions are answered, and the way to the next one. Not drawn while something has happened. */
export function AnswersProgress() {
  const { total, answered, next, goTo } = useSettingsPage();
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-linear-to-r from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
      <div className="flex flex-1 flex-col gap-2">
        <p className="font-display text-lg font-semibold text-fg-strong">
          {answered === total ? "Every question answered" : `${answered} of ${total} answered`}
        </p>
        <p className="text-sm text-fg-normal">Each answer tailors what Expecting tells you to do, and when. Change any of them here.</p>
        {/* On a surface, so it shows on the tint. */}
        <ProgressBar label="Questions answered" value={answered} max={total} className="mt-1 h-1.5 bg-bg-normal" />
      </div>
      {next ? (
        <Button intent="brand" onClick={() => goTo(next)} className="self-start sm:self-center">
          Answer the next one
        </Button>
      ) : null}
    </div>
  );
}
