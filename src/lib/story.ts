// The Journal as one story: everything kept, and what was done, newest first
// under its week and day. It shows what's kept and never what's missing: a
// lens only once its kind has something, a pattern only once there's enough
// to be one, and a run of weeks with nothing folded into one line. What was
// done in the Planner is its backbone, so a Journal nobody wrote in still
// tells the story.

import { type AppetiteEntry, describe as describeAppetite, sicknessWeeks, tally } from "./appetite";
import type { BingoMoment } from "./bingo";
import { addDays, type ISODate, todayISO } from "./dates";
import type { Feeling } from "./feelings";
import { feelingsOf, isOwn, STEP_LABEL } from "./feelings";
import { type FirstMark, firstOf, isMarked } from "./firsts";
import { dayOf, type Night, nightLine, nightsOf, type Start } from "./itsTime";
import { type JournalEntry, PATTERN_DAYS, type Place, placeOf, timeNow } from "./journal";
import type { Paper } from "./papers";
import { PAPER_KIND_LABEL } from "./papers";
import { BUMP_SERIES, bumpWeeks, PHOTO_KIND_LABEL, type Photo } from "./photos";
import type { Week } from "./timeline";
import type { WeeklyPair } from "./weekly";

/** One line of the story. */
export type StoryItem = { key: string; day: ISODate; time: string | null; by: string | null; createdAt: string } & (
  | { kind: "note"; entry: JournalEntry }
  | { kind: "letter"; entry: JournalEntry }
  /** A day's movements, on one line: their times, never a count. */
  | { kind: "movements"; entries: JournalEntry[] }
  | { kind: "appetite"; entry: AppetiteEntry }
  | { kind: "photo"; photo: Photo }
  | { kind: "paper"; paper: Paper }
  | { kind: "feeling"; feeling: Feeling }
  | { kind: "first"; mark: FirstMark & { day: string } }
  /** A task ticked off in the Planner, on the day it was. */
  | { kind: "done"; taskId: string; title: string }
  /** The night it started (It's time): its times on one line, never the contractions one by one. */
  | { kind: "night"; night: Night }
  | { kind: "question"; pair: WeeklyPair }
  | { kind: "bingo"; moment: BingoMoment }
);

type StoryKind = StoryItem["kind"];

/** The ways to look at the story: all of it, or one kind. */
export const LENSES = ["all", "notes", "movements", "appetite", "photos", "feelings", "papers", "firsts"] as const;
export type Lens = (typeof LENSES)[number];

export const LENS_LABEL: Record<Lens, string> = {
  all: "All",
  notes: "Notes",
  movements: "Movements",
  appetite: "Sickness & cravings",
  photos: "Photos",
  feelings: "Feelings",
  papers: "Papers",
  firsts: "Firsts",
};

const LENS_OF: Record<StoryKind, Lens | null> = {
  note: "notes",
  letter: "notes",
  movements: "movements",
  appetite: "appetite",
  photo: "photos",
  paper: "papers",
  feeling: "feelings",
  first: "firsts",
  done: null,
  night: null,
  question: null,
  bingo: null,
};

/** The lens a line belongs to; what was done belongs only to All. */
export function lensOf(item: StoryItem): Lens | null {
  return LENS_OF[item.kind];
}

/**
 * Folded away while something has happened, behind one quiet line: the
 * baby's movements, the sickness and cravings, the photos and the firsts.
 * The night it started too, and bingo. The notes, letters, feelings, papers and what was done stay.
 */
export function foldedWhileQuiet(item: StoryItem): boolean {
  return (
    item.kind === "movements" || item.kind === "appetite" || item.kind === "photo" || item.kind === "first" || item.kind === "night" || item.kind === "bingo"
  );
}

/** Everything that goes into the story. */
export type StorySources = {
  journal: readonly JournalEntry[];
  appetite: readonly AppetiteEntry[];
  photos: readonly Photo[];
  papers: readonly Paper[];
  feelings: readonly Feeling[];
  firsts: readonly FirstMark[];
  /** Task id to when it was ticked. */
  ticks: Record<string, string>;
  /** Task id to its title: the tasks shown (a tick for one no longer shown isn't in the story). */
  titles: ReadonlyMap<string, string>;
  /** It's time's starts: the ones that ended "We're there" are in the story. */
  starts: readonly Start[];
  /** A question a week's weeks both of you have answered. */
  weekly?: readonly WeeklyPair[];
  /** Pregnancy bingo's bingos and full houses. */
  bingo?: readonly BingoMoment[];
};

/** Newest first: by day, then time (a line with none after the timed ones), then when it was kept. */
function newest(a: StoryItem, b: StoryItem): number {
  return b.day.localeCompare(a.day) || (b.time ?? "").localeCompare(a.time ?? "") || b.createdAt.localeCompare(a.createdAt);
}

/** Every line of the story, newest first. */
export function storyItems(s: StorySources): StoryItem[] {
  const items: StoryItem[] = [];
  const base = (key: string, day: string, time: string | null, by: string | null, createdAt: string) => ({ key, day: day as ISODate, time, by, createdAt });
  const moved = new Map<string, JournalEntry[]>();
  for (const e of s.journal) {
    if (e.kind === "movement") moved.set(e.day, [...(moved.get(e.day) ?? []), e]);
    else items.push({ ...base(e.id, e.day, e.time, e.by, e.createdAt), kind: e.kind, entry: e });
  }
  for (const [day, entries] of moved) {
    const sorted = [...entries].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    const last = sorted.at(-1)!;
    // One by each of you on the same day is still one line. It never says who (they're the baby's), but "since you looked" asks who kept them.
    const by = new Set(sorted.map((e) => e.by)).size === 1 ? last.by : null;
    items.push({ ...base(`moved-${day}`, day, last.time, by, last.createdAt), kind: "movements", entries: sorted });
  }
  for (const e of s.appetite) items.push({ ...base(e.id, e.day, e.time, e.by, e.createdAt), kind: "appetite", entry: e });
  for (const p of s.photos) items.push({ ...base(p.id, p.day, p.time, p.by, p.createdAt), kind: "photo", photo: p });
  for (const p of s.papers) items.push({ ...base(p.id, p.day, null, p.by, p.createdAt), kind: "paper", paper: p });
  for (const f of s.feelings) items.push({ ...base(f.id, f.day, f.time, f.by, f.createdAt), kind: "feeling", feeling: f });
  for (const m of s.firsts) if (isMarked(m)) items.push({ ...base(`first-${m.key}`, m.day, null, m.by, m.createdAt), kind: "first", mark: m });
  for (const [taskId, at] of Object.entries(s.ticks)) {
    const title = s.titles.get(taskId);
    if (title) items.push({ ...base(`done-${taskId}`, todayISO(new Date(at)), null, null, at), kind: "done", taskId, title });
  }
  for (const night of nightsOf(s.starts)) {
    const { start } = night;
    items.push({ ...base(`night-${start.id}`, dayOf(start.startedAt), timeNow(new Date(start.startedAt)), start.by, start.startedAt), kind: "night", night });
  }
  for (const m of s.bingo ?? [])
    items.push({ ...base(`bingo-${m.kind}-${m.personId}`, m.day, null, m.personId, `${m.day}T23:59:59.999Z`), kind: "bingo", moment: m });
  for (const pair of s.weekly ?? [])
    items.push({ ...base(`question-${pair.week}`, pair.day, null, null, pair.answers[1]!.answeredAt), kind: "question", pair });
  return items.sort(newest);
}

/** The lenses there's something for, in their fixed order: All first, always. While something has happened, not the folded kinds. */
export function lensesKept(items: readonly StoryItem[], quiet: boolean): Lens[] {
  const kept = new Set(items.filter((i) => !(quiet && foldedWhileQuiet(i))).map(lensOf));
  return LENSES.filter((l) => l === "all" || kept.has(l));
}

/** Who a line names: `name` gives a person's name from their id. */
type Namer = (id: string | null) => string | null;

/** The words a line can be found by. */
function storyText(item: StoryItem, name: Namer = () => null): string {
  const words = ((): (string | null)[] => {
    switch (item.kind) {
      case "note":
      case "letter":
        return [item.entry.body, item.kind === "letter" ? "letter" : "note"];
      case "movements":
        return ["moving movement kick", ...item.entries.map((e) => e.body)];
      case "appetite":
        return [describeAppetite(item.entry), item.entry.note, item.entry.kind === "off" ? "gone off" : item.entry.kind];
      case "photo":
        return [PHOTO_KIND_LABEL[item.photo.kind], item.photo.caption, "photo"];
      case "paper":
        return [item.paper.title, PAPER_KIND_LABEL[item.paper.kind], item.paper.note, "paper"];
      case "feeling":
        return [STEP_LABEL[item.feeling.step], ...(isOwn(item.feeling) ? [...item.feeling.words, item.feeling.note] : []), "feeling"];
      case "first":
        return [firstOf(item.mark.key).title, ...item.mark.words.map((w) => w.body), "first"];
      case "done":
        return [item.title, "done"];
      case "night":
        return [nightLine(item.night), "it started labour"];
      case "question":
        return [item.pair.question, ...item.pair.answers.map((a) => a.body), "question"];
      case "bingo":
        return [item.moment.kind === "full" ? "full house" : "bingo", "bingo"];
    }
  })();
  return [...words, name(item.by)].filter(Boolean).join(" ").toLocaleLowerCase("en-AU");
}

/** Whether a line has every word of `query`, in any case. An empty query matches all. */
export function storyMatches(item: StoryItem, query: string, name?: Namer): boolean {
  const text = storyText(item, name);
  return query
    .toLocaleLowerCase("en-AU")
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => text.includes(w));
}

/** A day of the story. */
export type StoryDay = { day: ISODate; items: StoryItem[] };

/** A week of the story (or before or after the pregnancy, or with no due date a month), its days newest first. */
export type StoryGroup = { kind: "group"; key: string; place: Place | null; month: string | null; days: StoryDay[] };

/** A run of weeks with nothing kept, folded into one line: "Weeks 9–13". */
export type StoryGap = { kind: "gap"; key: string; from: Week; to: Week };

/** The story as it's drawn: its groups, and between them the quiet weeks. */
export function storyGroups(items: readonly StoryItem[], dueDate: ISODate | null): (StoryGroup | StoryGap)[] {
  const groups: StoryGroup[] = [];
  for (const item of [...items].sort(newest)) {
    const place = dueDate ? placeOf(item.day, dueDate) : null;
    const month = dueDate ? null : item.day.slice(0, 7);
    const key = String(place ?? month);
    let group = groups.at(-1);
    if (group?.key !== key) {
      group = { kind: "group", key, place, month, days: [] };
      groups.push(group);
    }
    const day = group.days.at(-1);
    if (day?.day === item.day) day.items.push(item);
    else group.days.push({ day: item.day, items: [item] });
  }
  const out: (StoryGroup | StoryGap)[] = [];
  for (const [i, group] of groups.entries()) {
    const prev = groups[i - 1];
    if (prev && typeof prev.place === "number" && typeof group.place === "number" && prev.place - group.place > 1) {
      out.push({ kind: "gap", key: `gap-${prev.place - 1}`, from: group.place + 1, to: prev.place - 1 });
    }
    out.push(group);
  }
  return out;
}

/** The trimesters, as weeks. */
export const TRIMESTERS = [
  { key: "first", title: "First trimester", from: 1, to: 13 },
  { key: "second", title: "Second trimester", from: 14, to: 27 },
  { key: "third", title: "Third trimester", from: 28, to: 42 },
] as const;
export type Trimester = (typeof TRIMESTERS)[number];

export function trimesterOf(week: Week): Trimester {
  return TRIMESTERS.find((t) => week <= t.to) ?? TRIMESTERS[2];
}

/** A week zoomed out: its picture (the bump, else any photo), the lenses it has something in, and its firsts. */
export type WeekTile = { week: Week; photo: Photo | null; lenses: Lens[]; firsts: FirstMark[]; done: number; quiet: boolean };

/** Every week from the first to the last that has anything (at least to `now`), newest first, each a tile; one with nothing is quiet. */
export function weekTiles(items: readonly StoryItem[], dueDate: ISODate, now: Week | null): WeekTile[] {
  const byWeek = new Map<Week, StoryItem[]>();
  for (const item of items) {
    const place = placeOf(item.day, dueDate);
    if (typeof place === "number") byWeek.set(place, [...(byWeek.get(place) ?? []), item]);
  }
  const last = Math.max(now ?? 0, ...byWeek.keys());
  const tiles: WeekTile[] = [];
  for (let week = last; week >= 1; week--) {
    const these = byWeek.get(week) ?? [];
    const photos = these.flatMap((i) => (i.kind === "photo" ? [i.photo] : []));
    tiles.push({
      week,
      photo: photos.find((p) => p.kind === "bump") ?? photos[0] ?? null,
      lenses: LENSES.filter((l) => l !== "all" && these.some((i) => lensOf(i) === l)),
      firsts: these.flatMap((i) => (i.kind === "first" ? [i.mark] : [])),
      done: these.filter((i) => i.kind === "done").length,
      quiet: these.length === 0,
    });
  }
  return tiles;
}

/** The firsts on the whole pregnancy's line: each at its week, in order. */
export function landmarks(firsts: readonly FirstMark[], dueDate: ISODate): { week: Week; mark: FirstMark & { day: string } }[] {
  return firsts
    .filter(isMarked)
    .flatMap((mark) => {
      const place = placeOf(mark.day as ISODate, dueDate);
      return typeof place === "number" ? [{ week: place, mark }] : [];
    })
    .sort((a, b) => a.week - b.week || a.mark.day.localeCompare(b.mark.day));
}

/**
 * How much a pattern needs before it's drawn: below it, the entries are
 * lines in the story. Movements on three days of the fortnight, sickness
 * in two weeks, a craving kept twice, three check-ins in four weeks, the
 * bump in two weeks. First guesses.
 */
export const PATTERN_MIN = { movementDays: 3, sickWeeks: 2, cravingTimes: 2, checkIns: 3, bumpWeeks: BUMP_SERIES } as const;

/** How far back the feelings' pattern looks, today among them. */
const FEELING_DAYS = 28;

export type Pattern = "movements" | "sickness" | "cravings" | "feelings" | "bump";

/** The patterns there's enough for, in a fixed order. `me`: whose feelings (a pattern of your own); none without. */
export function patternsKept({
  journal,
  appetite,
  feelings,
  photos,
  today,
  dueDate,
  me,
  quiet,
}: {
  journal: readonly JournalEntry[];
  appetite: readonly AppetiteEntry[];
  feelings: readonly Feeling[];
  photos: readonly Photo[];
  today: ISODate;
  dueDate: ISODate | null;
  me: string | null;
  quiet: boolean;
}): Pattern[] {
  const from = addDays(today, 1 - PATTERN_DAYS);
  const movedDays = new Set(journal.filter((e) => e.kind === "movement" && e.day >= from && e.day <= today).map((e) => e.day));
  // Sickness is a pattern only while it's still going: some in the last fortnight, and in two weeks.
  const sickLately = appetite.some((e) => e.kind === "sick" && e.day >= from && e.day <= today);
  const sickWeeks = sickLately ? sicknessWeeks(appetite, today, dueDate).filter((w) => w.sickDays > 0).length : 0;
  const craved = tally(appetite, "craving")[0]?.times ?? 0;
  const checkIns = me ? feelingsOf(feelings, me).filter((f) => f.day >= addDays(today, 1 - FEELING_DAYS)).length : 0;
  const all: [Pattern, boolean][] = [
    ["movements", !quiet && movedDays.size >= PATTERN_MIN.movementDays],
    ["sickness", !quiet && sickWeeks >= PATTERN_MIN.sickWeeks],
    ["cravings", !quiet && craved >= PATTERN_MIN.cravingTimes],
    ["feelings", checkIns >= PATTERN_MIN.checkIns],
    ["bump", !quiet && bumpWeeks(photos, dueDate).length >= PATTERN_MIN.bumpWeeks],
  ];
  return all.filter(([, ok]) => ok).map(([p]) => p);
}

/** "a scan, 2 notes and movements": what a few lines hold, a phrase each kind. Movements are never counted. */
export function summarise(items: readonly StoryItem[]): string {
  const count = (pred: (i: StoryItem) => boolean) => items.filter(pred).length;
  const phrase = (n: number, one: string, many: string) => (n === 0 ? null : n === 1 ? one : `${n} ${many}`);
  const photos = items.flatMap((i) => (i.kind === "photo" ? [i.photo] : []));
  const sick = count((i) => i.kind === "appetite" && i.entry.kind === "sick");
  const parts = [
    phrase(
      count((i) => i.kind === "first"),
      "a first",
      "firsts"
    ),
    phrase(photos.filter((p) => p.kind === "scan").length, "a scan", "scans"),
    phrase(photos.filter((p) => p.kind !== "scan").length, "a photo", "photos"),
    phrase(
      count((i) => i.kind === "letter"),
      "a letter",
      "letters"
    ),
    phrase(
      count((i) => i.kind === "note"),
      "a note",
      "notes"
    ),
    phrase(
      count((i) => i.kind === "paper"),
      "a paper",
      "papers"
    ),
    phrase(
      count((i) => i.kind === "appetite" && i.entry.kind !== "sick"),
      "a craving",
      "cravings"
    ),
    sick > 0 ? "sickness" : null,
    items.some((i) => i.kind === "movements") ? "movements" : null,
    phrase(
      count((i) => i.kind === "feeling"),
      "a check-in",
      "check-ins"
    ),
    phrase(
      count((i) => i.kind === "done"),
      "a thing done",
      "things done"
    ),
    items.some((i) => i.kind === "night") ? "the night it started" : null,
  ].filter((p): p is string => p !== null);
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

/** A craving's thread: how many times it's been kept, since when, and the last time before this one. */
export function cravingThread(entries: readonly AppetiteEntry[], id: string): { what: string; times: number; first: ISODate; before: ISODate | null } | null {
  const entry = entries.find((e) => e.id === id);
  if (!entry || entry.kind === "sick" || !entry.what) return null;
  const key = (what: string) => what.trim().toLocaleLowerCase("en-AU").replace(/\s+/g, " ");
  const same = entries.filter((e) => e.kind === entry.kind && e.what && key(e.what) === key(entry.what!));
  const days = same.map((e) => e.day).sort();
  const before = same
    .filter((e) => e.id !== id && (e.day < entry.day || (e.day === entry.day && e.createdAt < entry.createdAt)))
    .map((e) => e.day)
    .sort()
    .at(-1);
  return { what: entry.what, times: same.length, first: days[0] as ISODate, before: (before as ISODate | undefined) ?? null };
}

/** A week with nothing kept, on the story's spine: its number, and its note's title. */
export type QuietWeek = { kind: "quiet"; key: string; week: Week };

/**
 * The story as a spine of weeks: every week from the latest (at least
 * `now`) back to the first, each with what's kept in it, or quiet: the
 * pregnancy's own weeks, never a blank slot. `except` is left out (this
 * week, drawn as its own page). After week 42 first, before the pregnancy
 * last. Without a due date, the months as kept.
 */
export function storySpine(items: readonly StoryItem[], dueDate: ISODate | null, now: Week | null, except: Week | null = null): (StoryGroup | QuietWeek)[] {
  const groups = storyGroups(items, dueDate).filter((g): g is StoryGroup => g.kind === "group");
  if (!dueDate) return groups;
  const byWeek = new Map(groups.flatMap((g) => (typeof g.place === "number" ? [[g.place, g] as const] : [])));
  const last = Math.max(now ?? 0, ...byWeek.keys());
  const out: (StoryGroup | QuietWeek)[] = groups.filter((g) => g.place === "after");
  for (let week = last; week >= 1; week--) {
    if (week === except) continue;
    out.push(byWeek.get(week) ?? { kind: "quiet", key: `quiet-${week}`, week });
  }
  return [...out, ...groups.filter((g) => g.place === "before")];
}

/** The lines of one week. */
export function inWeek(items: readonly StoryItem[], week: Week, dueDate: ISODate | null): StoryItem[] {
  return dueDate ? items.filter((i) => placeOf(i.day, dueDate) === week) : [];
}
