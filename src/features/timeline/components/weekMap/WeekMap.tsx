import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { Diamond } from "lucide-react";
import { Fragment } from "react";
import { STEP_LABEL, type Step } from "../../../../lib/feelings";
import type { Week } from "../../../../lib/timeline";
import { type MapWeek, TRIMESTERS, trimester } from "../../../../lib/timelineMap";

/** What a week has, in a few words: what opens, what's to do, what's done, what was kept. */
function line(w: MapWeek): { text: string; warn: boolean }[] {
  const parts: { text: string; warn: boolean }[] = w.opening.map((i) => ({ text: `${i.title} opens`, warn: false }));
  if (w.slipped) parts.push({ text: `${w.toDo} slipped`, warn: true });
  else if (w.toDo > 0) parts.push({ text: `${w.toDo} to do`, warn: false });
  if (w.done > 0) parts.push({ text: `✓ ${w.done} done`, warn: false });
  if (w.asked > 0) parts.push({ text: w.asked === 1 ? "1 question asked" : `${w.asked} questions asked`, warn: false });
  if (w.kept > 0) parts.push({ text: w.kept === 1 ? "1 note" : `${w.kept} notes`, warn: false });
  if (w.moved) parts.push({ text: "felt moving", warn: false });
  return parts;
}

/**
 * Every week, one line each, under its trimester: its note's title or a
 * landmark, and what it has. A week goes to This week at that week, where its
 * detail is. One column on a phone; the trimesters side by side on a desktop.
 */
export function WeekMap({ weeks, at }: { weeks: MapWeek[]; at: Week | undefined }) {
  const chapters = ([1, 2, 3] as const).map((t) => ({ t, weeks: weeks.filter((w) => trimester(w.week) === t) }));

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
      {chapters.map(({ t, weeks }) => (
        <section key={t} aria-labelledby={`trimester-${t}`}>
          <h2 id={`trimester-${t}`} className="mb-1 text-xs font-semibold tracking-widest text-fg-subtle uppercase">
            {TRIMESTERS[t]}
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
                    <Headline week={w} />
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

/** A dot's strength, as in the Journal: faint to full, in the brand's colour, and fainter still here so the line stays quiet. */
const STRENGTH: Record<Step, string> = { rough: "opacity-30", low: "opacity-40", okay: "opacity-55", good: "opacity-70", great: "opacity-85" };

/** How each of you felt that week: one faint dot each, nothing louder. */
function Felt({ steps }: { steps: Step[] }) {
  return (
    <span className="flex shrink-0 items-center gap-1 pr-3">
      <span className="sr-only">Felt: {steps.map((s) => STEP_LABEL[s]).join(", ")}</span>
      {steps.map((step, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: one dot a person, in a fixed order.
        <span key={i} aria-hidden className={cn("size-2 rounded-full bg-fg-brand", STRENGTH[step])} />
      ))}
    </span>
  );
}

function Headline({ week: w }: { week: MapWeek }) {
  if (w.isNow) {
    return (
      <span className="flex items-center gap-2 truncate font-medium text-fg-brand">
        Today{w.title ? <span className="truncate font-normal text-fg-strong">{w.title}</span> : null}
      </span>
    );
  }
  if (w.landmark) {
    return (
      <span className="flex items-center gap-1.5 truncate font-medium text-fg-brand">
        <Diamond aria-hidden size={12} className="shrink-0 fill-current" />
        {w.landmark}
      </span>
    );
  }
  return w.title ? <span className="truncate text-fg-normal">{w.title}</span> : null;
}
