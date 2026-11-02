// The story, written like a diary: the day in the margin, the words running
// as writing, photos large, a craving a small chip (the same one twice on a
// day once, "twice"), sickness and feelings marks beside the words. No card
// and no buttons on every line: tap one to change it, in a sheet. The weeks
// are the spine: each with its note's title, a week with nothing kept one
// faint line, never a blank slot.

import { Modal } from "@sixthshift/design-system/modal";
import { cn } from "@sixthshift/design-system/utils";
import { Check, FileText, Footprints, Hourglass, IceCreamCone, MessagesSquare, PartyPopper, Star, Waves } from "lucide-react";
import { memo, type ReactNode, useCallback, useRef, useState } from "react";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { useQuietQuery } from "../../../../api/rpc/quiet";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import { useKeepSame } from "../../../../app/hooks/useKeepSame";
import { type AppetiteEntry, HOW_LABEL } from "../../../../lib/appetite";
import { formatDate, type ISODate, todayISO } from "../../../../lib/dates";
import { isOwn, STEP_LABEL } from "../../../../lib/feelings";
import { firstOf } from "../../../../lib/firsts";
import { nightLine } from "../../../../lib/itsTime";
import { asOne, formatTime, type JournalEntry } from "../../../../lib/journal";
import { PAPER_KIND_LABEL } from "../../../../lib/papers";
import { kindsOffered, type Photo } from "../../../../lib/photos";
import type { QuietWeek, StoryDay, StoryGap, StoryGroup, StoryItem } from "../../../../lib/story";
import { type Week, weekDates, weekLabel } from "../../../../lib/timeline";
import { Face } from "../../../feelings/components/Face";
import { NightDetail } from "../../../itsTime/components/night/NightDetail";
import { describePhoto } from "../../model/describePhoto";
import { weekTitle } from "../../model/weekTitle";
import { AppetiteItem } from "../entries/appetite/AppetiteItem";
import { FirstSheet } from "../entries/firsts/FirstSheet";
import { Movement } from "../entries/movements/Movement";
import { Note } from "../entries/notes/Note";
import { PaperViewer } from "../entries/papers/PaperViewer";
import { PhotoViewer } from "../entries/photos/PhotoViewer";
import { Picture } from "../entries/photos/Picture";

/** "Week 28", "Before the pregnancy", "After week 42", or with no due date the month: "October 2026". */
function groupHeading(group: StoryGroup): string {
  if (group.place === "before") return "Before the pregnancy";
  if (group.place === "after") return "After week 42";
  if (group.place !== null) return weekLabel(group.place);
  return formatDate(`${group.month}-01` as ISODate, { month: "long", year: "numeric" });
}

/** "27 Oct – 2 Nov". */
function range(week: Week, dueDate: ISODate | null): string | null {
  const dates = weekDates(week, dueDate);
  return dates ? `${formatDate(dates.start, { day: "numeric", month: "short" })} – ${formatDate(dates.end, { day: "numeric", month: "short" })}` : null;
}

/** "Today", "Thu 29". */
function dayLabel(day: ISODate, today: ISODate): string {
  return day === today ? "Today" : formatDate(day, { weekday: "short", day: "numeric" });
}

/** The name a line says when it isn't yours: "Sam". Yours says nothing, as a diary wouldn't. */
function useOther(): (id: string | null) => string | null {
  const { data: people } = usePeopleQuery();
  return (id) => (id === null || id === people.me?.id ? null : (people.people.find((p) => p.id === id)?.name ?? null));
}

/** A sheet to change or delete what a line holds. */
function EntrySheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : onClose())} aria-label={title}>
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">{title}</h2>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-3 px-6 pb-6">{children}</Modal.Body>
    </Modal>
  );
}

/** A line you can open: the whole line is the button, no buttons on it. */
function Opens({ label, onOpen, children }: { label: string; onOpen: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className="-mx-2 block w-[calc(100%+1rem)] rounded-md px-2 py-1 text-left hover:bg-bg-normal-hovered focus-visible:ring-2 focus-visible:ring-border-focus"
    >
      {children}
    </button>
  );
}

/** "— Sam", quietly after the words: only on a line that's someone's voice (a note, a letter, a feeling), never on her body's or the baby's. */
function By({ name }: { name: string | null }) {
  return name ? <span className="text-sm text-fg-subtle"> — {name}</span> : null;
}

/** " · 9:40 pm". */
function At({ time }: { time: string | null }) {
  return time ? <span className="text-sm text-fg-subtle"> · {formatTime(time)}</span> : null;
}

function NoteLine({ item }: { item: Extract<StoryItem, { kind: "note" | "letter" }> }) {
  const [open, setOpen] = useState(false);
  const other = useOther();
  const letter = item.kind === "letter";
  return (
    <>
      <Opens label={`Open: ${item.entry.body.slice(0, 60)}`} onOpen={() => setOpen(true)}>
        {letter ? <span className="block text-xs font-semibold text-fg-brand">A letter to the baby</span> : null}
        <span className={cn("whitespace-pre-wrap text-fg-strong", letter && "font-display text-lg")}>{item.entry.body}</span>
        <By name={letter && item.entry.fromBoth ? "from both of you" : other(item.by)} />
        <At time={item.time} />
      </Opens>
      {open ? (
        <EntrySheet title={letter ? "A letter to the baby" : "A note"} onClose={() => setOpen(false)}>
          <Note entry={item.entry} />
        </EntrySheet>
      ) : null}
    </>
  );
}

/** A day's movements' times, as one rhythm: two kept within a few minutes (both of you, for the same kick) are one time. One kept without a time stays as "a time". */
function movedTimes(entries: readonly JournalEntry[]): { id: string; time: string | null; different: boolean }[] {
  const timed = entries.flatMap((e) => (e.time ? [{ id: e.id, time: e.time, different: e.different }] : []));
  return [...asOne(timed), ...entries.filter((e) => !e.time).map((e) => ({ id: e.id, time: null, different: e.different }))];
}

/** A day's movements on one line: the baby's, so no name, whoever felt them. */
function MovedLine({ item }: { item: Extract<StoryItem, { kind: "movements" }> }) {
  const [open, setOpen] = useState(false);
  const words = item.entries.map((e) => e.body).filter(Boolean);
  return (
    <>
      <Opens label="Open: felt moving" onOpen={() => setOpen(true)}>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-fg-normal">
          <Footprints aria-hidden size={16} className="text-fg-brand" />
          <span className="text-fg-strong">Felt moving</span>
          {movedTimes(item.entries).map((e) => (
            <span key={e.id} className={cn("text-sm", e.different ? "rounded-full px-1.5 ring-2 ring-fg-brand" : "text-fg-subtle")}>
              {e.time ? formatTime(e.time) : "a time"}
              {e.different ? <span className="sr-only">, slower, weaker or stopped</span> : null}
            </span>
          ))}
        </span>
        {words.length > 0 ? <span className="mt-0.5 block text-fg-normal">{words.join(" · ")}</span> : null}
      </Opens>
      {open ? (
        <EntrySheet title="Felt moving" onClose={() => setOpen(false)}>
          {[...item.entries].reverse().map((e) => (
            <Movement key={e.id} entry={e} />
          ))}
        </EntrySheet>
      ) : null}
    </>
  );
}

const TIMES = ["", "", "twice", "three times", "four times", "five times"];

/** A day's sickness, or a craving (or something gone off) kept on it, however many times: one line. */
function AppetiteLine({ entries }: { entries: AppetiteEntry[] }) {
  const [open, setOpen] = useState(false);
  const first = entries[0]!;
  const sick = first.kind === "sick";
  const notes = entries.map((e) => e.note).filter(Boolean);
  const times = entries.length > 1 ? (TIMES[entries.length] ?? `${entries.length} times`) : null;
  return (
    <>
      <Opens label={sick ? "Open: sickness" : `Open: ${first.what}`} onOpen={() => setOpen(true)}>
        {sick ? (
          <span className="flex flex-wrap items-center gap-2 text-fg-normal">
            <Waves aria-hidden size={16} className="text-fg-brand" />
            {entries.map((e) => HOW_LABEL[e.how ?? "queasy"]).join(", ")}
          </span>
        ) : (
          <span className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-brand-subtle px-2.5 py-0.5 text-sm text-fg-on-brand-subtle">
              <IceCreamCone aria-hidden size={14} />
              {first.kind === "off" ? `Gone off ${first.what}` : first.what}
            </span>
            {times ? <span className="text-sm text-fg-subtle">{times}</span> : null}
          </span>
        )}
        {notes.length > 0 ? <span className="mt-0.5 block text-fg-normal">{notes.join(" · ")}</span> : null}
      </Opens>
      {open ? (
        <EntrySheet title={sick ? "Sickness" : first.kind === "off" ? "Gone off" : "A craving"} onClose={() => setOpen(false)}>
          {entries.map((e) => (
            <AppetiteItem key={e.id} entry={e} />
          ))}
        </EntrySheet>
      ) : null}
    </>
  );
}

function PaperLine({ item }: { item: Extract<StoryItem, { kind: "paper" }> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Opens label={`Open: ${item.paper.title}`} onOpen={() => setOpen(true)}>
        <span className="flex items-center gap-2 text-fg-normal">
          <FileText aria-hidden size={16} className="text-fg-brand" />
          <span className="text-fg-strong">{item.paper.title}</span>
          <span className="text-sm text-fg-subtle">{PAPER_KIND_LABEL[item.paper.kind]}</span>
        </span>
      </Opens>
      {open ? <PaperViewer id={item.paper.id} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function FeelingLine({ item }: { item: Extract<StoryItem, { kind: "feeling" }> }) {
  const other = useOther();
  const { feeling } = item;
  const words = isOwn(feeling) ? [...feeling.words, feeling.note].filter(Boolean).join(", ") : null;
  return (
    <p className="flex items-center gap-2 py-1 text-fg-normal">
      <span className="text-fg-brand">
        <Face step={feeling.step} size={16} />
      </span>
      <span>
        Felt {STEP_LABEL[feeling.step].toLowerCase()}
        {words ? <span>: {words}</span> : null}
        <By name={other(feeling.by)} />
      </span>
    </p>
  );
}

function FirstLine({ item }: { item: Extract<StoryItem, { kind: "first" }> }) {
  const [open, setOpen] = useState(false);
  const { data: people } = usePeopleQuery();
  const name = (id: string) => (id === people.me?.id ? "You" : (people.people.find((p) => p.id === id)?.name ?? "One of you"));
  const { title, question } = firstOf(item.mark.key);
  return (
    <>
      <Opens label={`Open: ${title}`} onOpen={() => setOpen(true)}>
        <span className="flex items-center gap-2 font-display text-lg font-semibold text-fg-strong">
          <Star aria-hidden size={18} className="fill-current text-fg-brand" />
          {title}
        </span>
        {item.mark.words.length > 0 ? (
          item.mark.words.map((w) => (
            <span key={w.by} className="mt-1 block border-l-2 border-border-brand pl-3 text-fg-normal">
              {w.body}
              <span className="text-sm text-fg-subtle"> — {name(w.by)}</span>
            </span>
          ))
        ) : (
          <span className="mt-0.5 block text-sm text-fg-subtle">{question}</span>
        )}
      </Opens>
      {open ? <FirstSheet mark={item.mark} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function NightLine({ item }: { item: Extract<StoryItem, { kind: "night" }> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Opens label="Open: it started" onOpen={() => setOpen(true)}>
        <span className="flex items-start gap-2 text-fg-normal">
          <Hourglass aria-hidden size={16} className="mt-1 shrink-0 text-fg-brand" />
          <span>{nightLine(item.night)}</span>
        </span>
      </Opens>
      {open ? (
        <EntrySheet title="It started" onClose={() => setOpen(false)}>
          <NightDetail night={item.night} onDeleted={() => setOpen(false)} />
        </EntrySheet>
      ) : null}
    </>
  );
}

/** A week's question, once both of you have answered: the question, then each answer and whose, the first given first. */
function QuestionLine({ item }: { item: Extract<StoryItem, { kind: "question" }> }) {
  const { data: people } = usePeopleQuery();
  const name = (id: string) => (id === people.me?.id ? "You" : (people.people.find((p) => p.id === id)?.name ?? "One of you"));
  return (
    <div className="py-1">
      <p className="flex items-start gap-2 font-medium text-fg-strong">
        <MessagesSquare aria-hidden size={16} className="mt-1 shrink-0 text-fg-brand" />
        <span>
          <span className="sr-only">The week's question: </span>
          {item.pair.question}
        </span>
      </p>
      {item.pair.answers.map((a) => (
        <p key={a.by} className="mt-1 ml-6 border-l-2 border-border-brand pl-3 whitespace-pre-line text-fg-normal">
          {a.body}
          <span className="text-sm text-fg-subtle"> — {name(a.by)}</span>
        </p>
      ))}
    </div>
  );
}

/** A bingo or a full house on someone's card, on the day it came. */
function BingoLine({ item }: { item: Extract<StoryItem, { kind: "bingo" }> }) {
  const { data: people } = usePeopleQuery();
  const who = item.moment.personId === people.me?.id ? "You" : (people.people.find((p) => p.id === item.moment.personId)?.name ?? "One of you");
  return (
    <p className="flex items-center gap-2 py-1 font-medium text-fg-strong">
      <PartyPopper aria-hidden size={16} className="shrink-0 text-fg-brand" />
      {item.moment.kind === "full" ? `${who === "You" ? "Your" : `${who}'s`} full house at pregnancy bingo` : `${who} got bingo!`}
    </p>
  );
}

function DoneLine({ item }: { item: Extract<StoryItem, { kind: "done" }> }) {
  return (
    <p className="flex items-center gap-2 py-1 text-sm text-fg-subtle">
      <Check aria-hidden size={14} className="shrink-0" />
      <span>
        <span className="sr-only">Done: </span>
        {item.title}
      </span>
    </p>
  );
}

/** One line of the story, but a photo (a day's are drawn together) or sickness and cravings (a day's are grouped). */
export function StoryLine({ item }: { item: StoryItem }) {
  switch (item.kind) {
    case "note":
    case "letter":
      return <NoteLine item={item} />;
    case "movements":
      return <MovedLine item={item} />;
    case "appetite":
      return <AppetiteLine entries={[item.entry]} />;
    case "paper":
      return <PaperLine item={item} />;
    case "feeling":
      return <FeelingLine item={item} />;
    case "first":
      return <FirstLine item={item} />;
    case "done":
      return <DoneLine item={item} />;
    case "night":
      return <NightLine item={item} />;
    case "question":
      return <QuestionLine item={item} />;
    case "bingo":
      return <BingoLine item={item} />;
    case "photo":
      return null;
  }
}

/** Photos, large: one across the page, several two to a row, each with its words. */
export function PhotoThumbs({ photos, onOpen }: { photos: readonly Photo[]; onOpen: (id: string) => void }) {
  const { data: settings } = useSettingsQuery();
  return (
    <ul className={cn("grid gap-2", photos.length > 1 && "grid-cols-2")}>
      {photos.map((photo) => (
        <li key={photo.id} className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onOpen(photo.id)}
            className="relative block w-full overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <Picture
              fileId={photo.fileId}
              variant={photos.length > 1 ? "thumb" : "display"}
              alt={describePhoto(photo, settings.dueDate)}
              className={cn("w-full object-cover", photos.length > 1 ? "aspect-square" : "aspect-4/3 max-h-112")}
            />
            {photo.kind === "scan" ? (
              <span aria-hidden className="absolute bottom-2 left-2 rounded-full bg-bg-normal px-2 text-xs text-fg-normal">
                Scan
              </span>
            ) : null}
          </button>
          {photo.caption ? <p className="text-fg-normal">{photo.caption}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/** A day's lines, with its sickness on one line and each thing craved on one, however many times. */
function dayLines(items: readonly StoryItem[]): ({ key: string; item: StoryItem } | { key: string; appetite: AppetiteEntry[] })[] {
  const out: ({ key: string; item: StoryItem } | { key: string; appetite: AppetiteEntry[] })[] = [];
  const groups = new Map<string, AppetiteEntry[]>();
  for (const item of items) {
    if (item.kind === "photo") continue;
    if (item.kind !== "appetite") {
      out.push({ key: item.key, item });
      continue;
    }
    const e = item.entry;
    const key = e.kind === "sick" ? "sick" : `${e.kind}:${(e.what ?? "").trim().toLocaleLowerCase("en-AU")}`;
    const group = groups.get(key);
    if (group) group.push(e);
    else {
      const entries = [e];
      groups.set(key, entries);
      out.push({ key: `appetite-${key}-${e.id}`, appetite: entries });
    }
  }
  return out;
}

/** A day: the day in the margin, its photos large, then its lines. Drawn again only when it changed. */
const Day = memo(function Day({ day, today, onOpenPhoto }: { day: StoryDay; today: ISODate; onOpenPhoto: (id: string) => void }) {
  const photos = day.items.flatMap((i) => (i.kind === "photo" ? [i.photo] : []));
  return (
    <li className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3">
      <h4 className="pt-1.5 text-xs font-medium tracking-wide text-fg-subtle uppercase">{dayLabel(day.day, today)}</h4>
      <div className="flex flex-col gap-1">
        {photos.length > 0 ? <PhotoThumbs photos={photos} onOpen={onOpenPhoto} /> : null}
        {dayLines(day.items).map((line) =>
          "item" in line ? <StoryLine key={line.key} item={line.item} /> : <AppetiteLine key={line.key} entries={line.appetite} />
        )}
      </div>
    </li>
  );
});

/** Photos, opened from any day of `groups`, one after another. `open` is the same each render, so a day isn't drawn again for it. */
function usePhotoViewer(groups: readonly (StoryGroup | StoryGap | QuietWeek)[]) {
  const { data: quiet } = useQuietQuery();
  const [viewing, setViewing] = useState<{ ids: string[]; index: number } | null>(null);
  const order = useRef<string[]>([]);
  order.current = groups.flatMap((g) => (g.kind === "group" ? g.days.flatMap((d) => d.items.flatMap((i) => (i.kind === "photo" ? [i.photo.id] : []))) : []));
  const open = useCallback((id: string) => setViewing({ ids: order.current, index: Math.max(0, order.current.indexOf(id)) }), []);
  const viewer = viewing ? (
    <PhotoViewer ids={viewing.ids} index={viewing.index} kinds={kindsOffered(quiet?.kind ?? null)} onClose={() => setViewing(null)} />
  ) : null;
  return { open, viewer };
}

/** A run of days, as the diary draws them. */
export function Days({ days: given }: { days: readonly StoryDay[] }) {
  const days = useKeepSame(given);
  const today = todayISO();
  const group: StoryGroup = { kind: "group", key: "days", place: null, month: null, days: [...days] };
  const { open, viewer } = usePhotoViewer([group]);
  return (
    <>
      <ol className="flex flex-col gap-4">
        {days.map((d) => (
          <Day key={d.day} day={d} today={today} onOpenPhoto={open} />
        ))}
      </ol>
      {viewer}
    </>
  );
}

/**
 * The story: its weeks newest first, each with its note's title and its
 * days; a quiet week one faint line; a run of them (in a search) one line.
 * Each week is `#week-28`, for a week to open at. `titled` false leaves out
 * the weeks' titles, which are about the baby (the quiet Journal).
 */
export function StoryList({
  groups: given,
  label = "The story",
  titled = true,
}: {
  groups: readonly (StoryGroup | StoryGap | QuietWeek)[];
  label?: string;
  titled?: boolean;
}) {
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
          if (g.kind === "gap") {
            return (
              <li key={g.key} className="py-1 text-sm text-fg-subtle">
                {g.from === g.to ? weekLabel(g.from) : `Weeks ${g.from}–${g.to}`}
              </li>
            );
          }
          if (g.kind === "quiet") {
            const title = titleOf(g.week);
            return (
              <li
                key={g.key}
                id={`week-${g.week}`}
                aria-label={`${weekLabel(g.week)}, nothing kept`}
                className="scroll-mt-24 border-t border-border-subtle py-1.5"
              >
                <p className="flex items-baseline gap-2 text-sm text-fg-subtle opacity-70">
                  <span className="w-16 shrink-0 tabular-nums">{weekLabel(g.week)}</span>
                  {title ? <span className="truncate">{title}</span> : null}
                </p>
              </li>
            );
          }
          const week = typeof g.place === "number" ? g.place : null;
          const title = week ? titleOf(week) : null;
          const aside = week ? [week === now ? "This week" : null, range(week, settings.dueDate)].filter(Boolean).join(" · ") : null;
          return (
            <li key={g.key} id={week ? `week-${week}` : undefined} className="scroll-mt-24 border-t border-border-subtle pt-3 pb-5">
              <section aria-label={groupHeading(g)} className="flex flex-col gap-3">
                <h3 className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display text-lg font-semibold text-fg-strong">{groupHeading(g)}</span>
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
