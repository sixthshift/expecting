import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { useSettingsQuery } from "../../../../api/rpc/settings";
import { formatDate, todayISO } from "../../../../lib/dates";
import { gestationLabel, positionOn, weekLabel } from "../../../../lib/timeline";
import { useOnboardingPage } from "../../contexts/OnboardingPageContext";
import { OnboardingFrame } from "../OnboardingFrame";

/** Done: where Expecting will open, and in. */
export function ReadyStep() {
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const { finish } = useOnboardingPage();
  const [opening, setOpening] = useState(false);
  const position = dueDate ? positionOn(todayISO(), dueDate) : null;
  const lead =
    dueDate && position ? (
      <>
        Expecting opens at {weekLabel(position.week).toLowerCase()} ({gestationLabel(position.gestationDays)}), due {formatDate(dueDate)}.
      </>
    ) : (
      "Expecting opens at the start. Add the due date when you have it, and it opens at your week."
    );

  return (
    <OnboardingFrame title="You're all set" lead={lead}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-fg-subtle">
          On your partner's phone, open Expecting and log in with the same password: it will ask who they are, and nothing else.
        </p>
        <Button
          intent="brand"
          size="xl"
          loading={opening}
          className="w-full"
          onClick={async () => {
            setOpening(true);
            await finish();
          }}
        >
          Open Expecting
        </Button>
      </div>
    </OnboardingFrame>
  );
}
