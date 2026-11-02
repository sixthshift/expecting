// Lately: the patterns there's enough for, each a small card that opens its
// lens. Only once a pattern has enough to be one (`patternsKept`): below that
// the entries are lines in the story, and nothing says what's missing.

import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";
import { useAppetite } from "../../../api/rpc/appetite";
import { useFeelings } from "../../../api/rpc/feelings";
import { useJournal } from "../../../api/rpc/journal";
import { usePeople } from "../../../api/rpc/people";
import { usePhotos } from "../../../api/rpc/photos";
import { useSettings } from "../../../api/rpc/settings";
import { sicknessWeeks, tally } from "../../../lib/appetite";
import { todayISO } from "../../../lib/dates";
import { type Step, stepsByDay } from "../../../lib/feelings";
import { dayFraction, movementPattern } from "../../../lib/journal";
import { bumpWeeks } from "../../../lib/photos";
import type { Lens, Pattern } from "../../../lib/story";
import { weekLabel } from "../../../lib/timeline";
import { Picture } from "./entries/photos/Picture";

const LENS: Record<Pattern, Lens> = { movements: "movements", sickness: "appetite", cravings: "appetite", feelings: "feelings", bump: "photos" };

const TITLE: Record<Pattern, string> = {
  movements: "Movements, this week",
  sickness: "Sickness, lately",
  cravings: "Cravings",
  feelings: "How you've been",
  bump: "Your bump",
};

/** A dot's strength: the step, faint to full, in the brand's colour (as the Feelings lens draws it). */
const STRENGTH: Record<Step, string> = { rough: "opacity-25", low: "opacity-45", okay: "opacity-65", good: "opacity-85", great: "opacity-100" };

function MovementsMini() {
  const { data: journal } = useJournal();
  const today = todayISO();
  const days = movementPattern(journal, today, 7);
  return (
    <span aria-hidden className="flex flex-col gap-1">
      {days.slice(0, 4).map((d) => (
        <span key={d.day} className="relative h-2 rounded-full bg-bg-subtle">
          {d.moved.map((m) => (
            <span
              key={m.id}
              style={{ left: `${dayFraction(m.time) * 100}%` }}
              className={cn("absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full", m.different ? "ring-2 ring-fg-brand" : "bg-fg-brand")}
            />
          ))}
        </span>
      ))}
    </span>
  );
}

function SicknessMini() {
  const { data: entries } = useAppetite();
  const { data: settings } = useSettings();
  const weeks = sicknessWeeks(entries, todayISO(), settings.dueDate).slice(0, 2);
  const fill = { queasy: "opacity-40", vomited: "opacity-75", fluids: "opacity-100" } as const;
  return (
    <span aria-hidden className="flex flex-col gap-1">
      {weeks.map((w) => (
        <span key={w.start} className="flex gap-1">
          {w.days.map((d) => (
            <span key={d.day} className={cn("size-3 rounded-sm", d.worst ? cn("bg-fg-brand", fill[d.worst]) : "bg-bg-subtle", d.ahead && "opacity-0")} />
          ))}
        </span>
      ))}
    </span>
  );
}

function CravingsMini() {
  const { data: entries } = useAppetite();
  const top = tally(entries, "craving").slice(0, 2);
  return (
    <span className="flex flex-col text-sm text-fg-normal">
      {top.map((t) => (
        <span key={t.what}>
          {t.what} <span className="text-fg-subtle">×{t.times}</span>
        </span>
      ))}
    </span>
  );
}

function FeelingsMini() {
  const { data: feelings } = useFeelings();
  const { data: people } = usePeople();
  if (!people.me) return null;
  const days = stepsByDay(feelings, people.me.id, todayISO(), 14);
  return (
    <span aria-hidden className="flex gap-1">
      {days.map((d) => (
        <span key={d.day} className={cn("size-2.5 rounded-full", d.step ? cn("bg-fg-brand", STRENGTH[d.step]) : "bg-bg-subtle")} />
      ))}
    </span>
  );
}

function BumpMini() {
  const { data: photos } = usePhotos();
  const { data: settings } = useSettings();
  const weeks = bumpWeeks(photos, settings.dueDate).slice(-4);
  return (
    <span className="flex gap-1">
      {weeks.map((b) => (
        <Picture
          key={b.week}
          fileId={b.photo.fileId}
          variant="thumb"
          alt={`Your bump at ${weekLabel(b.week).toLowerCase()}`}
          className="size-10 rounded object-cover"
        />
      ))}
    </span>
  );
}

const MINI: Record<Pattern, () => ReactNode> = {
  movements: MovementsMini,
  sickness: SicknessMini,
  cravings: CravingsMini,
  feelings: FeelingsMini,
  bump: BumpMini,
};

/** The patterns there's enough for, each opening its lens. Nothing at all when there's none. */
export function Lately({ patterns, onOpen }: { patterns: readonly Pattern[]; onOpen: (lens: Lens) => void }) {
  if (patterns.length === 0) return null;
  return (
    <section aria-labelledby="lately" className="flex flex-col gap-2">
      <h2 id="lately" className="text-sm font-semibold text-fg-strong">
        Lately
      </h2>
      <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:overflow-visible lg:px-0">
        {patterns.map((p) => {
          const Mini = MINI[p];
          return (
            <li key={p} className="w-40 shrink-0 lg:w-auto">
              <button
                type="button"
                onClick={() => onOpen(LENS[p])}
                className="flex h-full w-full flex-col gap-2 rounded-lg border border-border-subtle bg-bg-normal p-3 text-left hover:bg-bg-normal-hovered focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                <span className="text-xs font-medium text-fg-subtle">{TITLE[p]}</span>
                <Mini />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
