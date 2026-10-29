import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { formatDate, type ISODate, todayISO } from "../../../../lib/dates";
import { gestationLabel, positionOn, weekLabel } from "../../../../lib/timeline";
import type { Screen, StepContext } from "../../model/step";

/** Done: where Expecting will open, and in. */
export function readyStep({ settings, finish }: StepContext): Screen {
  return { title: "You're all set", lead: <ReadyLine dueDate={settings.dueDate} />, body: <Ready onOpen={finish} /> };
}

function ReadyLine({ dueDate }: { dueDate: ISODate | null }) {
  if (!dueDate) return "Expecting opens at the start. Add the due date when you have it, and it opens at your week.";
  const position = positionOn(todayISO(), dueDate);
  return (
    <>
      Expecting opens at {weekLabel(position.week).toLowerCase()} ({gestationLabel(position.gestationDays)}), due {formatDate(dueDate)}.
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
