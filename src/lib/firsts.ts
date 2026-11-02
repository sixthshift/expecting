// The firsts: the moments people look back on most, each marked on its day
// by either of you, with a question asked once it's marked and answered by
// each of you in your own words. Some are suggested from what's kept or done,
// only ever as a question to confirm, never marked on their own: a first is
// yours to claim. One said no to is put aside (`day` null) and not asked again.

import type { Task } from "../content/schema";
import type { ISODate } from "./dates";
import type { Person } from "./people";
import type { StoryItem } from "./story";
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

/** What the suggestions look at besides a line: who the partner is, and the first each task keeps. */
type Looking = { partners: ReadonlySet<string>; keeps: ReadonlyMap<string, FirstKey> };

/** A first that `line` counts for: the key when `counts` says it does. */
const when =
  (key: FirstKey, counts: (line: StoryItem, looking: Looking) => boolean) =>
  (line: StoryItem, looking: Looking): FirstKey | null =>
    counts(line, looking) ? key : null;

/**
 * What suggests a first: the story's lines that count for it, and why. The
 * earliest line that counts gives the first its day.
 */
const SUGGESTED_BY: readonly { why: string; first: (line: StoryItem, looking: Looking) => FirstKey | null }[] = [
  { why: "Your first scan photo", first: when("first-scan", (l) => l.kind === "photo" && l.photo.kind === "scan") },
  { why: "Your first bump photo", first: when("showing", (l) => l.kind === "photo" && l.photo.kind === "bump") },
  { why: "The first movement you kept", first: when("first-kick", (l) => l.kind === "movements") },
  {
    why: "The first movement the partner kept",
    first: when("felt-outside", (l, { partners }) => l.kind === "movements" && l.entries.some((e) => e.by !== null && partners.has(e.by))),
  },
  { why: "The first craving you kept", first: when("first-craving", (l) => l.kind === "appetite" && l.entry.kind === "craving") },
  // A task that keeps a first (`keeps: { first }`: the cot, the bag), ticked.
  { why: "Ticked off in the Planner", first: (l, { keeps }) => (l.kind === "done" ? (keeps.get(l.taskId) ?? null) : null) },
  { why: "The night it started, in It's time", first: when("it-started", (l) => l.kind === "night") },
];

/**
 * The firsts the story suggests (`items`, from `storyItems`), in FIRSTS's
 * order, each on the day of the earliest line that counts for it (see
 * SUGGESTED_BY), leaving out any marked or put aside (`marks`). Never while
 * something has happened.
 */
export function suggestFirsts({
  items,
  marks,
  tasks,
  people,
  quiet,
}: {
  items: readonly StoryItem[];
  marks: readonly FirstMark[];
  /** The tasks, for those that keep a first. */
  tasks: readonly Pick<Task, "id" | "keeps">[];
  people: readonly Person[];
  quiet: boolean;
}): Suggestion[] {
  if (quiet) return [];
  const looking: Looking = {
    partners: new Set(people.filter((p) => p.role === "partner").map((p) => p.id)),
    keeps: new Map(tasks.flatMap((t) => (typeof t.keeps === "object" && t.keeps !== null && "first" in t.keeps ? [[t.id, t.keeps.first]] : []))),
  };
  const found = new Map<FirstKey, Suggestion>();
  // Oldest first (the story is newest first), so the first line found for a first is its earliest.
  for (const line of [...items].reverse()) {
    for (const { why, first } of SUGGESTED_BY) {
      const key = first(line, looking);
      if (key && !found.has(key)) found.set(key, { key, day: line.day, why });
    }
  }
  const kept = new Set(marks.map((m) => m.key));
  return FIRSTS.flatMap((f) => {
    const s = found.get(f.key);
    return s && !kept.has(f.key) ? [s] : [];
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
