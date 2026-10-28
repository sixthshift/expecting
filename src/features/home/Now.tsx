import { Card } from "@sixthshift/design-system/card";
import { ProgressBar } from "@sixthshift/design-system/progress-bar";
import type { ReactNode } from "react";
import { saveHousehold } from "../../api/rpc/household";
import { DateForm } from "../../components/DateForm";
import { sizeLabel, type WeekNote } from "../../content/weeks";
import { daysBetween, formatDate, type ISODate, todayISO } from "../../lib/dates";
import { dueDateBounds, gestationLabel, type Position, TERM_DAYS, weekLabel } from "../../lib/timeline";
import { useAction } from "../household/useAction";

/** Where you are: "28+0 · 84 days to go · due Wed, 20 Jan 2027". */
export function NowLine({ position, dueDate, today, small }: { position: Position; dueDate: ISODate; today: ISODate; small?: boolean }): ReactNode {
  const toGo = daysBetween(today, dueDate);
  return (
    <p className={small ? "text-sm text-fg-strong" : "text-lg text-fg-strong"}>
      <span className="font-semibold">{gestationLabel(position.gestationDays)}</span>
      {" · "}
      {toGo > 0 ? `${toGo} days to go` : toGo === 0 ? "due today" : `${-toGo} days past the due date`}
      <span className="text-fg-subtle"> · due {formatDate(dueDate)}</span>
    </p>
  );
}

/**
 * The top of This week: where you are, as a page heading ("Week 28"),
 * the baby's size when this week's note gives it, and how far along you are.
 */
export function Hero({ position, dueDate, today, size }: { position: Position; dueDate: ISODate; today: ISODate; size: WeekNote["size"] }) {
  const label = size ? sizeLabel(size) : null;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <h1 className="flex flex-col text-fg-strong">
        <span className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">This week</span>
        <span className="text-4xl font-semibold lg:text-5xl">{weekLabel(position.week)}</span>
      </h1>
      {label ? <p className="text-fg-normal">{label.charAt(0).toUpperCase() + label.slice(1)}.</p> : null}
      <div className="flex max-w-md flex-col gap-1">
        <ProgressBar completed={position.gestationDays} total={TERM_DAYS} showFraction={false} label="Through the pregnancy" />
        <NowLine position={position} dueDate={dueDate} today={today} small />
      </div>
    </div>
  );
}

/** No due date yet (onboarding skipped it). Entering one places "now". */
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
