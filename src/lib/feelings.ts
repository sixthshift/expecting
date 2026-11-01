// How you're feeling: a step a day (or more), with words if you want them.
// The step is shared, so you can look out for each other; the words and
// what you wrote are only ever sent to the phone of the person they're
// about. A courtesy, not security: anyone with the password can say they're
// you. See docs/product/journal.md.

import { addDays, type ISODate } from "./dates";

/** The five steps, lowest first. Words, never numbers: a "3/5" is a score. */
export const STEPS = ["rough", "low", "okay", "good", "great"] as const;
export type Step = (typeof STEPS)[number];

/** The words to pick from after the step. Shorter is better than complete. */
export const WORDS = [
  "tired",
  "anxious",
  "worried",
  "overwhelmed",
  "teary",
  "irritable",
  "flat",
  "lonely",
  "scared",
  "calm",
  "happy",
  "excited",
  "connected",
  "grateful",
] as const;
export type Word = (typeof WORDS)[number];

/** A feeling as either of you sees it: who, when, and the step. */
export type Feeling = {
  id: string;
  by: string;
  day: string;
  /** HH:MM, if given. */
  time: string | null;
  step: Step;
  createdAt: string;
};

/** A feeling as its own person sees it: the words and what they wrote too. */
export type OwnFeeling = Feeling & { words: Word[]; note: string | null };

export function isOwn(feeling: Feeling | OwnFeeling): feeling is OwnFeeling {
  return "words" in feeling;
}

/** How a step is said. */
export const STEP_LABEL: Record<Step, string> = { rough: "Rough", low: "Low", okay: "Okay", good: "Good", great: "Great" };

/** The steps that count towards a hard fortnight. */
const LOW_STEPS: readonly Step[] = ["rough", "low"];

/** Oldest first: by day, then time (one without a time by when it was kept), then when it was kept. */
function inOrder<F extends Feeling>(feelings: readonly F[]): F[] {
  return [...feelings].sort(
    (a, b) =>
      a.day.localeCompare(b.day) ||
      (a.time ?? a.createdAt.slice(11, 16)).localeCompare(b.time ?? b.createdAt.slice(11, 16)) ||
      a.createdAt.localeCompare(b.createdAt)
  );
}

/** One person's feelings, oldest first. */
export function feelingsOf<F extends Feeling>(feelings: readonly F[], by: string): F[] {
  return inOrder(feelings.filter((f) => f.by === by));
}

/** One person's latest feeling on a day: the day's, as the dots show it. */
export function latestOn<F extends Feeling>(feelings: readonly F[], by: string, day: ISODate): F | undefined {
  return feelingsOf(feelings, by)
    .filter((f) => f.day === day)
    .at(-1);
}

/** Each day from `days` ago up to `today`, oldest first, with one person's latest step on it, or null. */
export function stepsByDay(feelings: readonly Feeling[], by: string, today: ISODate, days: number): { day: ISODate; step: Step | null }[] {
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i - days + 1);
    return { day, step: latestOn(feelings, by, day)?.step ?? null };
  });
}

/** The words someone used most since `from`, by how many days they used each, most first. */
export function wordsUsed(feelings: readonly OwnFeeling[], from: ISODate): { word: Word; days: number }[] {
  const days = new Map<Word, Set<string>>();
  for (const f of feelings) {
    if (f.day < from) continue;
    for (const word of f.words) days.set(word, (days.get(word) ?? new Set()).add(f.day));
  }
  return [...days].map(([word, on]) => ({ word, days: on.size })).sort((a, b) => b.days - a.days || WORDS.indexOf(a.word) - WORDS.indexOf(b.word));
}

/** One person's step for a week, as the timeline shows it: the middle of their days' steps, or null with none. */
export function weekStep(feelings: readonly Feeling[], by: string, start: ISODate, end: ISODate): Step | null {
  const steps = [...new Set(feelingsOf(feelings, by).map((f) => f.day))]
    .filter((day) => day >= start && day <= end)
    .map((day) => STEPS.indexOf(latestOn(feelings, by, day as ISODate)!.step))
    .sort((a, b) => a - b);
  return steps.length ? STEPS[steps[Math.floor((steps.length - 1) / 2)]!]! : null;
}

/** The days a fortnight looks at, and how many of them must have a check-in before it says anything. */
export const FORTNIGHT = { days: 14, checkIns: 4 } as const;

/**
 * Whether the last fortnight has been hard for someone, from their own
 * feelings: at least four days checked in, and on most of them the day ended
 * Low or Rough, or "anxious" was among the words. A first guess, not from a
 * source (docs/product/journal.md). It never names a condition.
 */
export function hardFortnight(feelings: readonly OwnFeeling[], today: ISODate): boolean {
  const from = addDays(today, 1 - FORTNIGHT.days);
  const days = new Map<string, OwnFeeling[]>();
  for (const f of inOrder(feelings)) if (f.day >= from && f.day <= today) days.set(f.day, [...(days.get(f.day) ?? []), f]);
  if (days.size < FORTNIGHT.checkIns) return false;
  const most = (count: number) => count > days.size / 2;
  const low = [...days.values()].filter((day) => LOW_STEPS.includes(day.at(-1)!.step)).length;
  const anxious = [...days.values()].filter((day) => day.some((f) => f.words.includes("anxious"))).length;
  return most(low) || most(anxious);
}
