import { sizeLabel, sizeLine } from "../../../../content/weeks";
import { formatDate } from "../../../../lib/dates";
import { toGo, weekRange } from "../../../../lib/labels";
import { gestationLabel, weekFromNow, weekLabel } from "../../../../lib/timeline";
import { WeekStepper } from "../../components/header/WeekStepper";
import { WholePregnancyLink } from "../../components/header/WholePregnancyLink";
import { SizeIcon } from "../../components/sizeIcon/SizeIcon";
import { Welcome } from "../../components/welcome/Welcome";
import { useHomePage } from "../../contexts/HomePageContext";
import { PregnancyStrip } from "../../features/timeline/components/strip/PregnancyStrip";

/**
 * The top of Home on a desktop: where you are, as a page heading ("Week
 * 28"), the baby's size when that week's own note gives it, and how far along
 * you are. Peeking at another week, the heading is that week, as seen from
 * this one ("Next week"), with its dates. Under it the whole pregnancy in a
 * line (a week goes to that week) and the way to the timeline; then a step
 * back or ahead. Until there's a due date, "Home" and the welcome.
 */
export function WeekHeader() {
  const { week, position, dueDate, note, peeking, today } = useHomePage();
  if (week === null || !position || !dueDate) {
    return (
      <div className="flex flex-col gap-6">
        <header className="pt-10">
          <h1 className="text-3xl font-display font-semibold text-fg-strong">Home</h1>
        </header>
        {!dueDate ? <Welcome /> : null}
      </div>
    );
  }
  // The size, when that week's own note gives it.
  const size = note?.week === week ? note.size : null;
  const range = weekRange(week, dueDate);
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 pt-10">
      <h1 className="col-start-1 row-start-1 flex flex-col text-fg-strong">
        <span className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">{weekFromNow(week, position.week)}</span>
        <span className="text-5xl font-display font-semibold">{weekLabel(week)}</span>
      </h1>
      {/* Its place is kept on a week without one, so the header is the same height every week. */}
      <div className="col-start-2 row-start-1 size-14 self-end justify-self-end">{size?.like ? <SizeIcon like={size.like} className="size-full" /> : null}</div>
      {/* One line, kept on every week, so going week to week moves nothing under it; the sentence is its title. */}
      <p className="col-span-full row-start-2 self-center truncate text-fg-normal" title={size ? sizeLabel(size) : undefined}>
        {size ? sizeLine(size) : " "}
      </p>
      <div className="col-span-full flex flex-col gap-2 pt-1">
        <PregnancyStrip now={position.week} at={week} />
        <div className="flex flex-wrap items-center justify-between gap-x-4">
          {peeking ? (
            range ? (
              <p className="text-sm text-fg-subtle">{range}</p>
            ) : (
              <span />
            )
          ) : (
            // Where you are: "28+0 · 84 days to go · due Wed, 20 Jan 2027".
            <p className="text-sm text-fg-strong">
              <span className="font-semibold">{gestationLabel(position.gestationDays)}</span>
              {" · "}
              {toGo(today, dueDate)}
              <span className="text-fg-subtle"> · due {formatDate(dueDate)}</span>
            </p>
          )}
          <WholePregnancyLink />
        </div>
      </div>
      <div className="col-span-full">
        <WeekStepper />
      </div>
    </header>
  );
}
