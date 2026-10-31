// The firsts: the moments people look back on most, each marked on its day
// by either of you, with a question asked once it's marked and answered by
// each of you in your own words. Some are suggested from what's kept or done,
// only ever as a question to confirm, never marked on their own: a first is
// yours to claim. One said no to is put aside (`day` null) and not asked again.

import type { Task } from "../content/schema";
import type { AppetiteEntry } from "./appetite";
import { type ISODate, todayISO } from "./dates";
import { dayOf, nightsOf, type Start } from "./itsTime";
import type { JournalEntry } from "./journal";
import type { Person } from "./people";
import type { Photo } from "./photos";
import type { Week } from "./timeline";

export const FIRST_KEYS = [
  "found-out",
  "heartbeat",
  "first-scan",
  "told-family",
  "first-craving",
  "showing",
  "boy-or-girl",
  "first-kick",
  "felt-outside",
  "first-outfit",
  "cot-up",
  "bag-packed",
  "it-started",
] as const;
export type FirstKey = (typeof FIRST_KEYS)[number];

export type FirstDef = {
  key: FirstKey;
  /** As it's marked: "Felt the first kick". */
  title: string;
  /** Asked once it's marked, of each of you. */
  question: string;
  /** Only when you know whether it's a boy or a girl. */
  knowing?: true;
  /** The weeks it usually comes in: when the Journal says it's around now, and what's still to come. A first guess, from the week notes and the Library's weeks; it can come any time. */
  weeks: [Week, Week];
};

/** In the order they usually come. */
export const FIRSTS: readonly FirstDef[] = [
  { key: "found-out", title: "Found out", question: "How did you find out, and who knew first?", weeks: [4, 7] },
  { key: "first-craving", title: "The first craving", question: "What was it, and how badly?", weeks: [5, 14] },
  { key: "first-scan", title: "The first scan", question: "What was it like seeing them?", weeks: [7, 13] },
  { key: "heartbeat", title: "Heard the heartbeat", question: "What did it sound like to you?", weeks: [8, 14] },
  { key: "told-family", title: "Told the family", question: "Who did you tell first, and how did they take it?", weeks: [10, 16] },
  { key: "showing", title: "Started showing", question: "Who noticed first?", weeks: [12, 20] },
  { key: "first-kick", title: "Felt the first kick", question: "Where were you, and what did it feel like?", weeks: [16, 24] },
  { key: "boy-or-girl", title: "Found out boy or girl", question: "Did you guess right?", knowing: true, weeks: [18, 22] },
  { key: "felt-outside", title: "Felt from the outside", question: "Who felt it, and what did they say?", weeks: [20, 28] },
  { key: "first-outfit", title: "Bought the first outfit", question: "What is it, and who chose it?", weeks: [14, 34] },
  { key: "cot-up", title: "The cot is up", question: "Where is it, and who put it together?", weeks: [28, 36] },
  { key: "bag-packed", title: "The bag is packed", question: "What's the one thing you made sure went in?", weeks: [32, 37] },
  { key: "it-started", title: "It started", question: "Where were you when it started?", weeks: [36, 42] },
];

export function isFirstKey(key: string): key is FirstKey {
  return (FIRST_KEYS as readonly string[]).includes(key);
}

export function firstOf(key: FirstKey): FirstDef {
  return FIRSTS.find((f) => f.key === key)!;
}

/** One of you's words for a first. */
type FirstWords = { by: string; body: string; editedAt: string };

/** A first as kept: marked on its day, or put aside (null). */
export type FirstMark = { key: FirstKey; day: string | null; by: string | null; createdAt: string; words: FirstWords[] };

/** Whether a first is marked (not put aside). */
export function isMarked(mark: FirstMark): mark is FirstMark & { day: string } {
  return mark.day !== null;
}

/** The firsts that can be marked: all, but boy or girl only when you know. */
export function firstsOffered(knowing: boolean): FirstDef[] {
  return FIRSTS.filter((f) => !f.knowing || knowing);
}

/** A first suggested from what's kept or done: which, the day, and why. */
export type Suggestion = { key: FirstKey; day: ISODate; why: string };

/** The earliest of `items` by day, then time. */
function earliest<T extends { day: string; time: string | null }>(items: readonly T[]): T | undefined {
  return [...items].sort((a, b) => a.day.localeCompare(b.day) || (a.time ?? "").localeCompare(b.time ?? ""))[0];
}

/**
 * The firsts suggested by what's kept or done, in FIRSTS's order, leaving
 * out any marked or put aside: the first scan photo, the first bump photo,
 * the first movement, the first one kept by the partner, the first craving,
 * a task ticked that keeps a first (`keeps: { first }`: the cot, the bag),
 * and the night it started. Never while something has happened.
 */
export function suggestFirsts({
  marks,
  journal,
  photos,
  appetite,
  ticks,
  tasks,
  people,
  quiet,
  starts = [],
}: {
  marks: readonly FirstMark[];
  journal: readonly JournalEntry[];
  photos: readonly Photo[];
  appetite: readonly AppetiteEntry[];
  ticks: Record<string, string>;
  /** The tasks, for those that keep a first. */
  tasks: readonly Pick<Task, "id" | "keeps">[];
  people: readonly Person[];
  quiet: boolean;
  /** It's time's starts: the first that ended "We're there" suggests "It started". */
  starts?: readonly Start[];
}): Suggestion[] {
  if (quiet) return [];
  const kept = new Set(marks.map((m) => m.key));
  const partners = new Set(people.filter((p) => p.role === "partner").map((p) => p.id));
  const movements = journal.filter((e) => e.kind === "movement");
  const found: Partial<Record<FirstKey, { day: string; why: string } | undefined>> = {};
  const from = (item: { day: string } | undefined, why: string) => (item ? { day: item.day, why } : undefined);
  found["first-scan"] = from(earliest(photos.filter((p) => p.kind === "scan")), "Your first scan photo");
  found.showing = from(earliest(photos.filter((p) => p.kind === "bump")), "Your first bump photo");
  found["first-kick"] = from(earliest(movements), "The first movement you kept");
  found["felt-outside"] = from(earliest(movements.filter((e) => e.by !== null && partners.has(e.by))), "The first movement the partner kept");
  found["first-craving"] = from(earliest(appetite.filter((e) => e.kind === "craving")), "The first craving you kept");
  const night = nightsOf(starts).at(-1);
  if (night) found["it-started"] = { day: dayOf(night.start.startedAt), why: "The night it started, in It's time" };
  for (const task of tasks) {
    const at = ticks[task.id];
    if (at && typeof task.keeps === "object" && task.keeps !== null && "first" in task.keeps)
      found[task.keeps.first] = { day: todayISO(new Date(at)), why: "Ticked off in the Planner" };
  }
  return FIRSTS.flatMap((f) => {
    const s = found[f.key];
    return s && !kept.has(f.key) ? [{ key: f.key, day: s.day as ISODate, why: s.why }] : [];
  });
}

/** How many firsts "around now" offers at once. */
const AROUND_NOW = 2;

/** Not yet marked or put aside, and offered (boy or girl only when you know). */
function open(marks: readonly FirstMark[], knowing: boolean): FirstDef[] {
  const kept = new Set(marks.map((m) => m.key));
  return firstsOffered(knowing).filter((f) => !kept.has(f.key));
}

/**
 * The firsts whose weeks take in this one, not yet marked or put aside:
 * the Journal's invitation, each with its question. Never while something
 * has happened, and none without a week.
 */
export function aroundNow({ now, marks, knowing, quiet }: { now: Week | null; marks: readonly FirstMark[]; knowing: boolean; quiet: boolean }): FirstDef[] {
  if (quiet || now === null) return [];
  return open(marks, knowing)
    .filter((f) => f.weeks[0] <= now && now <= f.weeks[1])
    .slice(0, AROUND_NOW);
}

/**
 * The firsts whose weeks are past, not yet marked or put aside, in the order
 * they come: some of this has already happened, and can still be kept, on
 * the day it was. Never while something has happened.
 */
export function alreadyHappened({
  now,
  marks,
  knowing,
  quiet,
}: {
  now: Week | null;
  marks: readonly FirstMark[];
  knowing: boolean;
  quiet: boolean;
}): FirstDef[] {
  if (quiet || now === null) return [];
  return open(marks, knowing).filter((f) => f.weeks[1] < now);
}
