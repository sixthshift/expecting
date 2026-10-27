import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { formatDate, todayISO } from "../../../lib/dates";
import { NOT_YET, STAGE } from "../../../lib/onboarding";
import { gestationLabel, positionOn, slotLabel } from "../../../lib/timeline";
import type { HouseholdState } from "../../household/load";
import type { Screen, StepContext } from "../step";

/** Done: where Expecting will open, and in. */
export function readyStep({ state, finish }: StepContext): Screen {
  return { title: "You're all set", lead: <ReadyLine state={state} />, body: <Ready onOpen={finish} /> };
}

function ReadyLine({ state }: { state: HouseholdState }) {
  const { dueDate, birthDate, profile } = state.household;
  if (!dueDate) {
    return profile[STAGE] === NOT_YET
      ? "Expecting opens at Getting ready: the things worth doing before a pregnancy. When you're expecting, add the due date and it moves with you."
      : "Expecting opens at the start. Add the due date when you have it, and it opens at your week.";
  }
  const position = positionOn(todayISO(), dueDate, birthDate);
  return (
    <>
      Expecting opens at {slotLabel(position.slot).toLowerCase()}
      {position.gestationDays !== undefined ? ` (${gestationLabel(position.gestationDays)})` : ""}, due {formatDate(dueDate)}.
    </>
  );
}

function Ready({ onOpen }: { onOpen: () => Promise<void> }) {
  const [opening, setOpening] = useState(false);
  return (
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
          await onOpen();
        }}
      >
        Open Expecting
      </Button>
    </div>
  );
}
