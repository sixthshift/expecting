import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { weekPaperWords } from "../../../../../../lib/papers";
import { weekPhotoWords } from "../../../../../../lib/photos";
import type { Week } from "../../../../../../lib/timeline";
import { TRIMESTERS, trimester } from "../../../../../../lib/timeline";
import type { TimelineWeek } from "../../../../../../lib/timelineWeeks";
import { Felt } from "./Felt";
import { WeekHeadline } from "./WeekHeadline";

/** What a week has, in a few words: what opens, what's to do, what's done, its appointments, what was kept. */
function line(w: TimelineWeek): { text: string; warn: boolean }[] {
  const parts: { text: string; warn: boolean }[] = w.opening.map((i) => ({ text: `${i.title} opens`, warn: false }));
  if (w.slipped) parts.push({ text: `${w.toDo} slipped`, warn: true });
  else if (w.toDo > 0) parts.push({ text: `${w.toDo} to do`, warn: false });
  if (w.done > 0) parts.push({ text: `✓ ${w.done} done`, warn: false });
  if (w.appointments > 0) parts.push({ text: w.appointments === 1 ? "an appointment" : `${w.appointments} appointments`, warn: false });
  if (w.asked > 0) parts.push({ text: w.asked === 1 ? "1 question asked" : `${w.asked} questions asked`, warn: false });
  if (w.kept > 0) parts.push({ text: w.kept === 1 ? "1 note" : `${w.kept} notes`, warn: false });
  if (w.moved) parts.push({ text: "felt moving", warn: false });
  if (w.sick > 0) parts.push({ text: w.sick === 1 ? "sick 1 day" : `sick ${w.sick} days`, warn: false });
  if (w.craved) parts.push({ text: `craved ${w.craved.trim().toLocaleLowerCase("en-AU")}`, warn: false });
  for (const text of weekPhotoWords(w.photos)) parts.push({ text, warn: false });
  for (const text of weekPaperWords(w.papers)) parts.push({ text, warn: false });
  return parts;
}

/**
 * Every week, one line each, under its trimester: its note's title or a
 * landmark, and what it has. A week goes to This week at that week, where its
 * detail is. One column on a phone; the trimesters side by side on a desktop.
 */
export function TimelineWeeks({ weeks, at }: { weeks: TimelineWeek[]; at: Week | undefined }) {
  const chapters = TRIMESTERS.map((t) => ({ t, weeks: weeks.filter((w) => trimester(w.week) === t) }));

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
      {chapters.map(({ t, weeks }) => (
        <section key={t.n} aria-labelledby={`trimester-${t.n}`}>
          <h2 id={`trimester-${t.n}`} className="mb-1 text-xs font-semibold tracking-widest text-fg-subtle uppercase">
            {t.title}
          </h2>
          <ol className="flex flex-col">
            {weeks.map((w) => (
              <li key={w.week} data-week={w.week} className="scroll-mt-24">
                <Link
                  to="/"
                  search={w.isNow ? {} : { at: w.week }}
                  aria-current={w.isNow ? "date" : undefined}
                  className={cn(
                    "group flex min-h-12 items-stretch rounded-md hover:bg-bg-normal-hovered",
                    w.isNow && "bg-bg-brand-subtle hover:bg-bg-brand-subtle",
                    w.week === at && !w.isNow && "ring-2 ring-border-brand"
                  )}
                >
                  <span
                    className={cn(
                      "flex w-11 shrink-0 items-center justify-center text-lg font-semibold tabular-nums",
                      w.isNow ? "text-fg-brand" : w.isPast ? "text-fg-subtle" : "text-fg-strong"
                    )}
                  >
                    <span className="sr-only">Week </span>
                    {w.week}
                  </span>
                  <span className={cn("flex min-w-0 flex-1 flex-col justify-center py-1.5 pr-2", w.isPast && !w.isNow && "opacity-75")}>
                    <WeekHeadline week={w} />
                    {line(w).length > 0 ? (
                      <span className={cn("truncate text-xs", w.isNow ? "text-fg-normal" : "text-fg-subtle")}>
                        {line(w).map((p, i) => (
                          <Fragment key={p.text}>
                            {i > 0 ? " · " : null}
                            <span className={cn(p.warn && "font-medium text-fg-warning")}>{p.text}</span>
                          </Fragment>
                        ))}
                      </span>
                    ) : null}
                  </span>
                  {w.felt.length > 0 ? <Felt steps={w.felt} /> : null}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
