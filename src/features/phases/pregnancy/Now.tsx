import { Card } from "@sixthshift/design-system/card";
import type { ReactNode } from "react";
import { saveHousehold } from "../../../api/rpc/household";
import { DateForm } from "../../../components/DateForm";
import { daysBetween, formatDate, type ISODate, todayISO } from "../../../lib/dates";
import { ageLabel, dueDateBounds, gestationLabel, type Position } from "../../../lib/timeline";
import { useAction } from "../../household/useAction";

/** Where you are: "28+0 · 84 days to go · due Wed, 20 Jan 2027". */
export function NowLine({ position, dueDate, today }: { position: Position; dueDate: ISODate; today: ISODate }): ReactNode {
  if (position.gestationDays !== undefined) {
    const toGo = daysBetween(today, dueDate);
    return (
      <p className="text-lg text-fg-strong">
        <span className="font-semibold">{gestationLabel(position.gestationDays)}</span>
        {" · "}
        {toGo > 0 ? `${toGo} days to go` : toGo === 0 ? "due today" : `${-toGo} days past the due date`}
        <span className="text-fg-subtle"> · due {formatDate(dueDate)}</span>
      </p>
    );
  }
  return <p className="text-lg text-fg-strong">{ageLabel(position.daysSinceBirth ?? 0)}</p>;
}

/** Expecting, with no due date yet (onboarding skipped it). Entering one places "now" in the pregnancy. */
export function Welcome() {
  const today = todayISO();
  const [save] = useAction((dueDate: ISODate | null) => saveHousehold({ data: { dueDate } }));
  return (
    <Card size="lg" className="my-6 max-w-lg">
      <DateForm
        label="When's the baby due?"
        description="Your best estimate is fine; change it after the dating scan. Every week is readable either way."
        value={null}
        submitLabel="Start"
        {...dueDateBounds(today)}
        onSave={save}
      />
    </Card>
  );
}
