// The story's lines: one for each thing kept or done, from each kind's own
// records, newest first. What was done in the Planner is its backbone, so a
// Journal nobody wrote in still tells the story. See docs/product/journal.md.

import type { AppetiteEntry } from "../appetite";
import type { BingoMoment } from "../bingo";
import { type ISODate, todayISO } from "../dates";
import type { Feeling } from "../feelings";
import { type FirstMark, isMarked } from "../firsts";
import { dayOf, type Night, nightsOf, type Start } from "../itsTime";
import { type JournalEntry, timeNow } from "../journal";
import type { Paper } from "../papers";
import type { Photo } from "../photos";
import type { WeeklyPair } from "../weekly";

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

/** The kinds of line. */
export type StoryKind = StoryItem["kind"];

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
export function byNewest(a: StoryItem, b: StoryItem): number {
  return b.day.localeCompare(a.day) || (b.time ?? "").localeCompare(a.time ?? "") || b.createdAt.localeCompare(a.createdAt);
}

/** Every line of the story, newest first: a line for each thing kept or done, from each kind's own. */
export function storyItems(s: StorySources): StoryItem[] {
  return [
    ...writtenLines(s.journal),
    ...movementLines(s.journal),
    ...s.appetite.map(appetiteLine),
    ...s.photos.map(photoLine),
    ...s.papers.map(paperLine),
    ...s.feelings.map(feelingLine),
    ...s.firsts.filter(isMarked).map(firstLine),
    ...doneLines(s.ticks, s.titles),
    ...nightsOf(s.starts).map(nightStoryLine),
    ...(s.bingo ?? []).map(bingoLine),
    ...(s.weekly ?? []).map(questionLine),
  ].sort(byNewest);
}

/** A note or a letter: a line each. */
function writtenLines(journal: readonly JournalEntry[]): StoryItem[] {
  return journal.flatMap((e) =>
    e.kind === "movement" ? [] : [{ key: e.id, day: e.day as ISODate, time: e.time, by: e.by, createdAt: e.createdAt, kind: e.kind, entry: e }]
  );
}

/**
 * A day's movements, on one line: their times in order, the line at the
 * last. One by each of you on the same day is still one line. It never says
 * who (they're the baby's), but "since you looked" asks who kept them, so it
 * has a `by` while one of you kept them all.
 */
function movementLines(journal: readonly JournalEntry[]): StoryItem[] {
  const byDay = new Map<string, JournalEntry[]>();
  for (const e of journal) if (e.kind === "movement") byDay.set(e.day, [...(byDay.get(e.day) ?? []), e]);
  return [...byDay].map(([day, entries]) => {
    const sorted = [...entries].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    const last = sorted.at(-1)!;
    const by = new Set(sorted.map((e) => e.by)).size === 1 ? last.by : null;
    return { key: `moved-${day}`, day: day as ISODate, time: last.time, by, createdAt: last.createdAt, kind: "movements", entries: sorted };
  });
}

const appetiteLine = (e: AppetiteEntry): StoryItem => ({
  key: e.id,
  day: e.day as ISODate,
  time: e.time,
  by: e.by,
  createdAt: e.createdAt,
  kind: "appetite",
  entry: e,
});

const photoLine = (p: Photo): StoryItem => ({ key: p.id, day: p.day as ISODate, time: p.time, by: p.by, createdAt: p.createdAt, kind: "photo", photo: p });

/** A paper has a day but no time. */
const paperLine = (p: Paper): StoryItem => ({ key: p.id, day: p.day as ISODate, time: null, by: p.by, createdAt: p.createdAt, kind: "paper", paper: p });

const feelingLine = (f: Feeling): StoryItem => ({
  key: f.id,
  day: f.day as ISODate,
  time: f.time,
  by: f.by,
  createdAt: f.createdAt,
  kind: "feeling",
  feeling: f,
});

/** A first, once it's marked (a first can be put away unmarked). */
const firstLine = (m: FirstMark & { day: string }): StoryItem => ({
  key: `first-${m.key}`,
  day: m.day as ISODate,
  time: null,
  by: m.by,
  createdAt: m.createdAt,
  kind: "first",
  mark: m,
});

/** A task ticked off, on the day it was: only one still shown (its title is in `titles`). A tick says when, not who. */
function doneLines(ticks: Record<string, string>, titles: ReadonlyMap<string, string>): StoryItem[] {
  return Object.entries(ticks).flatMap(([taskId, at]) => {
    const title = titles.get(taskId);
    return title ? [{ key: `done-${taskId}`, day: todayISO(new Date(at)), time: null, by: null, createdAt: at, kind: "done" as const, taskId, title }] : [];
  });
}

/** The night it started, at its start. */
function nightStoryLine(night: Night): StoryItem {
  const { start } = night;
  return {
    key: `night-${start.id}`,
    day: dayOf(start.startedAt),
    time: timeNow(new Date(start.startedAt)),
    by: start.by,
    createdAt: start.startedAt,
    kind: "night",
    night,
  };
}

/** A bingo or a full house: on its day, after anything kept that day. */
const bingoLine = (m: BingoMoment): StoryItem => ({
  key: `bingo-${m.kind}-${m.personId}`,
  day: m.day as ISODate,
  time: null,
  by: m.personId,
  createdAt: `${m.day}T23:59:59.999Z`,
  kind: "bingo",
  moment: m,
});

/** A question a week, once both of you have answered: kept when the second answer was. */
const questionLine = (pair: WeeklyPair): StoryItem => ({
  key: `question-${pair.week}`,
  day: pair.day as ISODate,
  time: null,
  by: null,
  createdAt: pair.answers[1]!.answeredAt,
  kind: "question",
  pair,
});

/** The records behind the story's lines, each kind's own: for what's worked out from them (the patterns, a recap). */
export function keptIn(items: readonly StoryItem[]) {
  const kept = {
    journal: [] as JournalEntry[],
    appetite: [] as AppetiteEntry[],
    photos: [] as Photo[],
    feelings: [] as Feeling[],
    firsts: [] as (FirstMark & { day: string })[],
  };
  for (const i of items) {
    if (i.kind === "note" || i.kind === "letter") kept.journal.push(i.entry);
    else if (i.kind === "movements") kept.journal.push(...i.entries);
    else if (i.kind === "appetite") kept.appetite.push(i.entry);
    else if (i.kind === "photo") kept.photos.push(i.photo);
    else if (i.kind === "feeling") kept.feelings.push(i.feeling);
    else if (i.kind === "first") kept.firsts.push(i.mark);
  }
  return kept;
}
