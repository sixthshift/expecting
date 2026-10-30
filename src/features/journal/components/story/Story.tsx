// The story: everything kept, and what was done, newest first, under its
// week (its note's title beside it) and day. A day's movements are one line,
// their times, never counted; a day's photos one row of thumbnails; a run of
// weeks with nothing one quiet line. Each line opens to change, as before.

import { cn } from "@sixthshift/design-system/utils";
import { Check, ChevronDown, Footprints } from "lucide-react";
import { useState } from "react";
import { usePeople } from "../../../../api/rpc/people";
import { useQuiet } from "../../../../api/rpc/quiet";
import { useNow, useSettings } from "../../../../api/rpc/settings";
import { weekNotes } from "../../../../content";
import { noteFor } from "../../../../content/weeks";
import { formatDate, type ISODate, todayISO } from "../../../../lib/dates";
import { isOwn, STEP_LABEL } from "../../../../lib/feelings";
import { formatTime } from "../../../../lib/journal";
import { kindsOffered, type Photo } from "../../../../lib/photos";
import type { StoryDay, StoryGap, StoryGroup, StoryItem } from "../../../../lib/story";
import { type Week, weekDates, weekLabel } from "../../../../lib/timeline";
import { Face } from "../../../feelings/components/Face";
import { AppetiteItem } from "../appetite/appetite";
import { FirstLine } from "../firsts/firsts";
import { Movement } from "../movements/movements";
import { Note } from "../notes/notes";
import { PaperRow } from "../papers/PaperRow";
import { PaperViewer } from "../papers/PaperViewer";
import { describePhoto, PhotoViewer } from "../photos/PhotoViewer";
import { Picture } from "../photos/Picture";

/** "Week 28", "Before the pregnancy", "After week 42", or with no due date the month: "October 2026". */
export function groupHeading(group: StoryGroup): string {
  if (group.place === "before") return "Before the pregnancy";
  if (group.place === "after") return "After week 42";
  if (group.place !== null) return weekLabel(group.place);
  return formatDate(`${group.month}-01` as ISODate, { month: "long", year: "numeric" });
}

/** A week's note's title, its days, and whether it's this one: "Halfway · This week · 27 Oct – 2 Nov". */
function aside(group: StoryGroup, dueDate: ISODate | null, now: Week | null): string | null {
  if (typeof group.place !== "number") return null;
  const dates = weekDates(group.place, dueDate);
  const range = dates ? `${formatDate(dates.start, { day: "numeric", month: "short" })} – ${formatDate(dates.end, { day: "numeric", month: "short" })}` : null;
  return [noteFor(weekNotes, group.place)?.title ?? null, group.place === now ? "This week" : null, range].filter(Boolean).join(" · ") || null;
}

/** "Today", "Thu 29 Oct". */
function dayLabel(day: ISODate, today: ISODate): string {
  return day === today ? "Today" : formatDate(day, { weekday: "short", day: "numeric", month: "short" });
}

/** The name a line says: "You", the other's name, or nothing. */
function useNamer(): (id: string | null) => string | null {
  const { data: people } = usePeople();
  return (id) => (id === null ? null : id === people.me?.id ? "You" : (people.people.find((p) => p.id === id)?.name ?? null));
}

/** A day's movements, one line: felt moving, and when, uncounted; one felt as different ringed. Opened, each, to change. */
function MovedLine({ item }: { item: Extract<StoryItem, { kind: "movements" }> }) {
  const [open, setOpen] = useState(false);
  const name = useNamer();
  const who = name(item.by);
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-bg-normal-hovered focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <Footprints aria-hidden size={18} className="shrink-0 text-fg-brand" />
        <span className="flex flex-1 flex-wrap items-center gap-x-2 text-fg-normal">
          <span className="font-medium text-fg-strong">Felt moving</span>
          {item.entries.map((e) => (
            <span key={e.id} className={cn("text-sm", e.different ? "rounded-full px-1.5 ring-2 ring-fg-brand" : "text-fg-subtle")}>
              {e.time ? formatTime(e.time) : "a time"}
              {e.different ? <span className="sr-only">, slower, weaker or stopped</span> : null}
            </span>
          ))}
          {who ? <span className="text-sm text-fg-subtle">· {who}</span> : null}
          {item.entries.some((e) => e.body) ? (
            <span className="basis-full text-sm text-fg-normal">
              {item.entries
                .map((e) => e.body)
                .filter(Boolean)
                .join(" · ")}
            </span>
          ) : null}
        </span>
        <ChevronDown aria-hidden size={16} className={cn("shrink-0 text-fg-subtle transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="flex flex-col gap-2 pl-8">
          {[...item.entries].reverse().map((e) => (
            <Movement key={e.id} entry={e} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** A check-in: the face, the step, and whose; your own words only to you. */
function FeelingLine({ item }: { item: Extract<StoryItem, { kind: "feeling" }> }) {
  const name = useNamer();
  const { feeling } = item;
  const words = isOwn(feeling) ? [...feeling.words, feeling.note].filter(Boolean).join(", ") : null;
  return (
    <p className="flex items-center gap-3 px-2 py-2 text-fg-normal">
      <span className="text-fg-brand">
        <Face step={feeling.step} size={18} />
      </span>
      <span>
        <span className="font-medium text-fg-strong">{STEP_LABEL[feeling.step]}</span>
        {words ? <span className="text-fg-normal"> · {words}</span> : null}
        <span className="text-sm text-fg-subtle"> · {[name(feeling.by), feeling.time ? formatTime(feeling.time) : null].filter(Boolean).join(", ")}</span>
      </span>
    </p>
  );
}

/** Something done in the Planner, on its day: quiet, a tick and what. */
function DoneLine({ item }: { item: Extract<StoryItem, { kind: "done" }> }) {
  return (
    <p className="flex items-center gap-3 px-2 py-1.5 text-sm text-fg-subtle">
      <Check aria-hidden size={16} className="shrink-0" />
      <span>
        <span className="sr-only">Done: </span>
        {item.title}
      </span>
    </p>
  );
}

/** A paper as a line, opened in place. */
function PaperLine({ item }: { item: Extract<StoryItem, { kind: "paper" }> }) {
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PaperRow paper={item.paper} dueDate={settings.dueDate} onOpen={() => setOpen(true)} />
      {open ? <PaperViewer id={item.paper.id} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/** One line of the story, but a photo (a day's are drawn together). */
export function StoryLine({ item }: { item: StoryItem }) {
  switch (item.kind) {
    case "note":
    case "letter":
      return <Note entry={item.entry} />;
    case "movements":
      return <MovedLine item={item} />;
    case "appetite":
      return <AppetiteItem entry={item.entry} />;
    case "paper":
      return <PaperLine item={item} />;
    case "feeling":
      return <FeelingLine item={item} />;
    case "first":
      return <FirstLine mark={item.mark} />;
    case "done":
      return <DoneLine item={item} />;
    case "photo":
      return null;
  }
}

/** Photos as a row of thumbnails, a scan said so. */
export function PhotoThumbs({ photos, onOpen }: { photos: readonly Photo[]; onOpen: (id: string) => void }) {
  const { data: settings } = useSettings();
  return (
    <ul className="grid grid-cols-3 gap-2 px-2 sm:grid-cols-4">
      {photos.map((photo) => (
        <li key={photo.id}>
          <button
            type="button"
            onClick={() => onOpen(photo.id)}
            className="relative block w-full overflow-hidden rounded-md focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <Picture fileId={photo.fileId} variant="thumb" alt={describePhoto(photo, settings.dueDate)} className="aspect-square w-full object-cover" />
            {photo.kind === "scan" ? (
              <span aria-hidden className="absolute bottom-1 left-1 rounded-full bg-bg-normal px-2 text-xs text-fg-normal">
                Scan
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** A day of the story: its photos together, then the rest. */
function Day({ day, today, onOpenPhoto }: { day: StoryDay; today: ISODate; onOpenPhoto: (id: string) => void }) {
  const photos = day.items.flatMap((i) => (i.kind === "photo" ? [i.photo] : []));
  return (
    <li className="flex flex-col gap-1">
      <h4 className="text-xs font-medium tracking-wide text-fg-subtle uppercase">{dayLabel(day.day, today)}</h4>
      {photos.length > 0 ? <PhotoThumbs photos={photos} onOpen={onOpenPhoto} /> : null}
      {day.items.map((item) => (item.kind === "photo" ? null : <StoryLine key={item.key} item={item} />))}
    </li>
  );
}

/** "Weeks 21–27", or "Week 21": nothing kept, one line. */
function Gap({ gap }: { gap: StoryGap }) {
  return (
    <li aria-label={gap.from === gap.to ? `${weekLabel(gap.from)}, nothing kept` : `Weeks ${gap.from} to ${gap.to}, nothing kept`}>
      <p className="border-l-2 border-dashed border-border-subtle py-1 pl-3 text-sm text-fg-subtle">
        {gap.from === gap.to ? weekLabel(gap.from) : `Weeks ${gap.from}–${gap.to}`}
      </p>
    </li>
  );
}

/** The story, as groups and quiet weeks. Each week is `#week-28`, for a week to open at. */
export function StoryList({ groups, label = "The story" }: { groups: readonly (StoryGroup | StoryGap)[]; label?: string }) {
  const { data: settings } = useSettings();
  const { data: quiet } = useQuiet();
  const now = useNow();
  const today = todayISO();
  const [viewing, setViewing] = useState<{ ids: string[]; index: number } | null>(null);
  const order = groups.flatMap((g) => (g.kind === "group" ? g.days.flatMap((d) => d.items.flatMap((i) => (i.kind === "photo" ? [i.photo.id] : []))) : []));
  const open = (id: string) => setViewing({ ids: order, index: Math.max(0, order.indexOf(id)) });

  return (
    <>
      <ol aria-label={label} className="flex flex-col gap-6">
        {groups.map((g) =>
          g.kind === "gap" ? (
            <Gap key={g.key} gap={g} />
          ) : (
            <li key={g.key} id={typeof g.place === "number" ? `week-${g.place}` : undefined} className="scroll-mt-24">
              <section aria-label={groupHeading(g)} className="flex flex-col gap-3">
                <h3 className="flex flex-wrap items-baseline gap-x-2 font-display text-base font-semibold text-fg-strong">
                  {groupHeading(g)}
                  <span className="font-sans text-sm font-normal text-fg-subtle">{aside(g, settings.dueDate, now)}</span>
                </h3>
                <ol className="flex flex-col gap-3">
                  {g.days.map((d) => (
                    <Day key={d.day} day={d} today={today} onOpenPhoto={open} />
                  ))}
                </ol>
              </section>
            </li>
          )
        )}
      </ol>
      {viewing ? <PhotoViewer ids={viewing.ids} index={viewing.index} kinds={kindsOffered(quiet?.kind ?? null)} onClose={() => setViewing(null)} /> : null}
    </>
  );
}
