import { addDays, type ISODate } from "../../dates";
import { type Feeling, feelingsOf, isOwn, type OwnFeeling, STEP_LABEL, weekStep, wordsUsed } from "../feelings";
import { LATELY_DAYS, list, type Summary } from "./summary";

/** How far back feelings look, today among them. */
const FEELING_DAYS = 28;

/** A person, as a feeling's record names them. */
export type Named = { id: string; name: string };

/**
 * Feelings over the last four weeks: for each of you who checked in, how
 * many days and the middle step; your own words most used, which only your
 * phone has. Null with none kept in that time.
 */
export function feelingsSummary(feelings: readonly (Feeling | OwnFeeling)[], people: readonly Named[], me: string | null, today: ISODate): Summary | null {
  const from = addDays(today, 1 - FEELING_DAYS);
  const lines: string[] = [];
  let headline: string | null = null;
  // You first, then the other.
  const order = [...people].sort((a, b) => Number(b.id === me) - Number(a.id === me));
  for (const person of order) {
    const days = new Set(
      feelingsOf(feelings, person.id)
        .filter((f) => f.day >= from && f.day <= today)
        .map((f) => f.day)
    ).size;
    if (days === 0) continue;
    const step = weekStep(feelings, person.id, from, today)!;
    const who = person.id === me ? "You" : person.name;
    // The answer is the first of you who checked in: you, if you did.
    headline ??= person.id === me ? `Mostly ${STEP_LABEL[step].toLowerCase()}` : `${person.name}: mostly ${STEP_LABEL[step].toLowerCase()}`;
    lines.push(`${who}: checked in on ${days === 1 ? "1 day" : `${days} days`} of the last four weeks, mostly ${STEP_LABEL[step].toLowerCase()}.`);
    if (person.id === me) {
      const own = feelingsOf(feelings, person.id).filter(isOwn);
      const words = wordsUsed(own, from)
        .slice(0, 3)
        .map((w) => w.word);
      if (words.length > 0) lines.push(`Your words most: ${list(words)}.`);
    }
  }
  if (!headline) return null;
  const lately = feelings.some((f) => f.day >= addDays(today, 1 - LATELY_DAYS) && f.day <= today);
  return { headline, lines, lately };
}
