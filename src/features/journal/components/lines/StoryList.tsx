// The story, written like a diary: the day in the margin, the words running
// as writing, photos large, a craving a small chip (the same one twice on a
// day once, "twice"), sickness and feelings marks beside the words. No card
// and no buttons on every line: tap one to change it, in a sheet. The weeks
// are the spine: each with its note's title, a week with nothing kept one
// faint line, never a blank slot.

import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import { useKeepSame } from "../../../../app/hooks/useKeepSame";
import { todayISO } from "../../../../lib/dates";
import { placeHeading, weekRange } from "../../../../lib/labels";
import type { StoryPart } from "../../../../lib/story/spine";
import { type Week, weekLabel } from "../../../../lib/timeline";
import { weekTitle } from "../../model/labels";

import { Day, usePhotoViewer } from "./Day";

/**
 * The story: its weeks newest first, each with its note's title and its
 * days; a week with nothing kept one faint line, a run of them one line.
 * Each week is `#week-28`, for a week to open at. `titled` false leaves out
 * the weeks' titles, which are about the baby (the quiet Journal).
 */
export function StoryList({ groups: given, label = "The story", titled = true }: { groups: readonly StoryPart[]; label?: string; titled?: boolean }) {
  // Worked out afresh each render: the weeks and days that didn't change are kept as they were.
  const groups = useKeepSame(given);
  const { data: settings } = useSettingsQuery();
  const now = useNow();
  const today = todayISO();
  const { open, viewer } = usePhotoViewer(groups);
  const titleOf = (week: Week) => (titled ? weekTitle(week) : null);

  return (
    <>
      <ol aria-label={label} className="flex flex-col">
        {groups.map((g) => {
          if (g.kind === "empty") {
            const single = g.from === g.to;
            const title = single ? titleOf(g.from) : null;
            const label = single ? weekLabel(g.from) : `Weeks ${g.from}–${g.to}`;
            return (
              <li
                key={g.key}
                id={single ? `week-${g.from}` : undefined}
                aria-label={`${label}, nothing kept`}
                className="scroll-mt-24 border-t border-border-subtle py-1.5"
              >
                <p className="flex items-baseline gap-2 text-sm text-fg-subtle opacity-70">
                  <span className="shrink-0 tabular-nums">{label}</span>
                  {title ? <span className="truncate">{title}</span> : null}
                </p>
              </li>
            );
          }
          const week = typeof g.place === "number" ? g.place : null;
          const title = week ? titleOf(week) : null;
          const aside = week ? [week === now ? "This week" : null, weekRange(week, settings.dueDate)].filter(Boolean).join(" · ") : null;
          return (
            <li key={g.key} id={week ? `week-${week}` : undefined} className="scroll-mt-24 border-t border-border-subtle pt-3 pb-5">
              <section aria-label={placeHeading(g.place, g.month)} className="flex flex-col gap-3">
                <h3 className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display text-lg font-semibold text-fg-strong">{placeHeading(g.place, g.month)}</span>
                  {title ? <span className="font-display text-fg-normal">{title}</span> : null}
                  {aside ? <span className="text-sm text-fg-subtle">{aside}</span> : null}
                </h3>
                <ol className="flex flex-col gap-4">
                  {g.days.map((d) => (
                    <Day key={d.day} day={d} today={today} onOpenPhoto={open} />
                  ))}
                </ol>
              </section>
            </li>
          );
        })}
      </ol>
      {viewer}
    </>
  );
}
