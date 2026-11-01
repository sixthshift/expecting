import { Card } from "@sixthshift/design-system/card";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { settingsSaves } from "../../../../api/rpc/settings";
import { useSave } from "../../../../app/hooks/useSave";
import { DateForm } from "../../../../components/DateForm";
import { sizeLabel, type WeekNote } from "../../../../content/weeks";
import { daysBetween, formatDate, type ISODate, todayISO } from "../../../../lib/dates";
import { dueDateBounds, gestationLabel, type Position, WEEKS, type Week, weekDates, weekFromNow, weekLabel } from "../../../../lib/timeline";
import { PregnancyStrip } from "../../../timeline/components/strip/PregnancyStrip";

/** Where you are: "28+0 · 84 days to go · due Wed, 20 Jan 2027". */
function NowLine({ position, dueDate, today, small }: { position: Position; dueDate: ISODate; today: ISODate; small?: boolean }): ReactNode {
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
 * The top of This week: where you are, as a page heading ("Week 28"), the
 * baby's size when that week's own note gives it, and how far along you are.
 * Peeking at another week, the heading is that week, as seen from this one
 * ("Next week"), with its dates. Under it the whole pregnancy in a line (a
 * week goes to that week) and the way to the map; then a step back or ahead.
 */
export function Hero({
  week,
  position,
  dueDate,
  today,
  size,
  due,
}: {
  week: Week;
  position: Position;
  dueDate: ISODate;
  today: ISODate;
  size: WeekNote["size"];
  /** The weeks ahead with something best done by then, dotted on the strip. */
  due: ReadonlySet<Week>;
}) {
  const label = size ? sizeLabel(size) : null;
  const peeking = week !== position.week;
  const dates = weekDates(week, dueDate);
  return (
    // Its parts sit in the header's grid (ThisWeek): the heading beside the phone's corner, the rest the full width under both.
    <div className="contents">
      <h1 className="col-start-1 row-start-1 flex flex-col text-fg-strong">
        <span className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">{weekFromNow(week, position.week)}</span>
        <span className="text-4xl font-display font-semibold lg:text-5xl">{weekLabel(week)}</span>
      </h1>
      {label ? <p className="col-span-full text-fg-normal">{label.charAt(0).toUpperCase() + label.slice(1)}.</p> : null}
      <div className="col-span-full flex flex-col gap-2 pt-1">
        <PregnancyStrip now={position.week} at={week} due={due} />
        <div className="flex flex-wrap items-center justify-between gap-x-4">
          {peeking ? (
            dates ? (
              <p className="text-sm text-fg-subtle">
                {formatDate(dates.start, { day: "numeric", month: "short" })} – {formatDate(dates.end, { day: "numeric", month: "short" })}
              </p>
            ) : (
              <span />
            )
          ) : (
            <NowLine position={position} dueDate={dueDate} today={today} small />
          )}
          <Link
            to="/timeline"
            search={peeking ? { at: week } : {}}
            className="flex min-h-11 items-center gap-1 text-sm font-medium text-fg-brand hover:underline"
          >
            The whole pregnancy
            <ChevronRight aria-hidden size={16} />
          </Link>
        </div>
      </div>
      <div className="col-span-full">
        <WeekStepper week={week} now={position.week} />
      </div>
    </div>
  );
}

const STEP = "flex min-h-11 items-center gap-1 rounded-md text-sm text-fg-subtle hover:text-fg-normal";

/** A step to the week before or after, and back to this one when away from it. */
function WeekStepper({ week, now }: { week: Week; now: Week }) {
  // This week is plain `/`, so it's the URL you'd share.
  const to = (w: Week) => (w === now ? {} : { at: w });
  return (
    <nav aria-label="Weeks" className="-ml-1 flex flex-wrap items-center gap-x-4">
      {week > WEEKS.first ? (
        <Link to="/" search={to(week - 1)} className={STEP}>
          <ChevronLeft aria-hidden size={16} />
          {weekLabel(week - 1)}
        </Link>
      ) : null}
      {week < WEEKS.last ? (
        <Link to="/" search={to(week + 1)} className={STEP}>
          {weekLabel(week + 1)}
          <ChevronRight aria-hidden size={16} />
        </Link>
      ) : null}
      {week !== now ? (
        <Link to="/" search={{}} className="flex min-h-11 items-center rounded-md text-sm font-medium text-fg-brand underline">
          Back to this week
        </Link>
      ) : null}
    </nav>
  );
}

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
