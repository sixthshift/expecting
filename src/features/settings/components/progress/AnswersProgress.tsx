import { Button } from "@sixthshift/design-system/button";
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
        {/* Onboarding's bar, on a surface so it shows on the tint. */}
        <div
          role="progressbar"
          aria-label="Questions answered"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answered}
          className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-normal"
        >
          <div
            className="h-full rounded-full bg-linear-to-r from-(--expecting-accent-from) to-(--expecting-accent-to) motion-safe:transition-[width] motion-safe:duration-500"
            style={{ width: `${(answered / total) * 100}%` }}
          />
        </div>
      </div>
      {next ? (
        <Button intent="brand" onClick={() => goTo(next)} className="self-start sm:self-center">
          Answer the next one
        </Button>
      ) : null}
    </div>
  );
}
