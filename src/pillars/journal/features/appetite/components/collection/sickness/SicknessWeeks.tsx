import { Button } from "@sixthshift/design-system/button";
import { cn } from "@sixthshift/design-system/utils";
import { useState } from "react";
import { useAppetiteQuery } from "../../../../../../../api/rpc/appetite";
import { useSettingsQuery } from "../../../../../../../api/rpc/settings";
import { formatDate, type ISODate, todayISO } from "../../../../../../../lib/dates";
import { HOW_LABEL, type How, OFTEN, oftenQuestion, type SickWeek, sicknessSince, sicknessWeeks, sickOften } from "../../../../../../../lib/journal/appetite";
import { dayAndWeek, shortDate, when } from "../../../../../../../lib/labels";
import { weekLabel } from "../../../../../../../lib/timeline";
import { ItemLink } from "../../../../../../library/components/itemLink/ItemLink";
import { AskCard } from "../../../../../../planner/features/questions/components/AskCard";
import { SEVERE } from "../../TooSick";

/** A day's strength, worst fullest, in the brand's colour: never red. Can't keep fluids down is also ringed. */
const STRENGTH: Record<How, string> = {
  queasy: "opacity-35",
  vomited: "opacity-75",
  fluids: "opacity-100 ring-2 ring-fg-brand ring-offset-1 ring-offset-bg-normal",
};

/** A week's row label: "Week 9", "Before the pregnancy", or with no due date the days: "24–30 Oct". */
function weekName(w: SickWeek, today: ISODate): string {
  if (w.place === "before") return "Before";
  if (w.place === "after") return "After 42";
  if (typeof w.place === "number") return weekLabel(w.place);
  // "24–30 Oct", or "29 Sep – 5 Oct" across a month.
  return w.start.slice(0, 7) === w.end.slice(0, 7)
    ? `${Number(w.start.slice(8))}–${shortDate(w.end, today)}`
    : `${shortDate(w.start, today)} – ${shortDate(w.end, today)}`;
}

/** "Today, 3:10 am" mid-sentence: "today, 3:10 am"; a date stays as it is. */
function lastSaid(said: string): string {
  return said.startsWith("Today") ? `t${said.slice(1)}` : said;
}

/** How many weeks show before "Show every week". */
const WEEKS_SHOWN = 8;

/**
 * Sickness, since when: the first day and the last, then the weeks as rows,
 * newest first, a cell a day, each day's worst at its strength (never red).
 * How often, and whether it's easing, are shown, not said. Above them, if
 * she's been sick often lately, one quiet line and a question to take along.
 */
export function SicknessWeeks() {
  const { data: entries } = useAppetiteQuery();
  const { data: settings } = useSettingsQuery();
  const [all, setAll] = useState(false);
  const today = todayISO();
  const since = sicknessSince(entries);
  if (!since) return null;
  const weeks = sicknessWeeks(entries, today, settings.dueDate);
  const shown = all ? weeks : weeks.slice(0, WEEKS_SHOWN);
  const often = sickOften(entries, today);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-fg-normal">
        <span className="font-medium text-fg-strong">Since {dayAndWeek(since.first, settings.dueDate)}.</span> Last:{" "}
        {lastSaid(when(since.last.day, since.last.time))}, {HOW_LABEL[since.last.how ?? "queasy"].toLowerCase()}.
      </p>
      {often ? (
        <div className="flex flex-col gap-2 rounded-lg bg-bg-subtle p-3 text-sm">
          <p className="text-fg-normal">
            Threw up on {often} of the last {OFTEN.days} days. Being sick often is worth a call to your midwife or doctor: there is treatment.
          </p>
          <AskCard text={oftenQuestion(often, shortDate(since.first, today))} />
          <ItemLink itemId={SEVERE} className="flex min-h-11 items-center text-fg-normal underline">
            When sickness is more than morning sickness
          </ItemLink>
        </div>
      ) : null}
      <figure className="flex flex-col gap-1">
        <figcaption className="text-sm text-fg-subtle">
          Each week a row, a square a day: fuller the worse it was, ringed when fluids wouldn't stay down.
        </figcaption>
        <ol className="flex flex-col gap-1">
          {shown.map((w) => (
            <li key={w.start} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-fg-subtle">{weekName(w, today)}</span>
              <span className="sr-only">
                {w.sickDays === 0
                  ? "none kept"
                  : w.days
                      .filter((d) => d.worst)
                      .map((d) => `${formatDate(d.day, { weekday: "short", day: "numeric", month: "short" })}: ${HOW_LABEL[d.worst!].toLowerCase()}`)
                      .join("; ")}
              </span>
              <span aria-hidden className="grid flex-1 grid-cols-7 gap-1">
                {w.days.map((d) => (
                  <span key={d.day} className={cn("flex h-5 items-center justify-center rounded-sm", d.ahead ? "bg-transparent" : "bg-bg-subtle")}>
                    {d.worst ? <span className={cn("size-3 rounded-full bg-fg-brand", STRENGTH[d.worst])} /> : null}
                  </span>
                ))}
              </span>
              <span className="w-14 shrink-0 text-right text-xs text-fg-subtle">
                {w.sickDays === 0 ? "–" : w.sickDays === 1 ? "1 day" : `${w.sickDays} days`}
              </span>
            </li>
          ))}
        </ol>
      </figure>
      {weeks.length > shown.length ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAll(true)}>
          Show every week
        </Button>
      ) : null}
    </div>
  );
}
