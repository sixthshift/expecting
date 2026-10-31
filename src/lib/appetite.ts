// Sickness and cravings: being sick, a craving, or something gone off, kept
// by either of you on its day. Shown back so you can answer the midwife's
// "since when? how often? getting better?", and for fun later ("pickles, 14
// times"). Never a score and never advice about her body: the only things it
// says are its sources' (can't keep fluids down is a call; craving things
// that aren't food is worth mentioning). See docs/plan-cravings-sickness.md.

import { addDays, daysBetween, type ISODate } from "./dates";
import { type Place, placeOf } from "./journal";
import type { Week } from "./timeline";

/** What an entry is: being sick, a craving, or something gone off. */
export const APPETITE_KINDS = ["sick", "craving", "off"] as const;
export type AppetiteKind = (typeof APPETITE_KINDS)[number];

/** How bad, least first: queasy, threw up, can't keep fluids down. One tap each; each time is its own. */
export const HOWS = ["queasy", "vomited", "fluids"] as const;
export type How = (typeof HOWS)[number];

export const HOW_LABEL: Record<How, string> = { queasy: "Queasy", vomited: "Threw up", fluids: "Can't keep fluids down" };

export type AppetiteEntry = {
  id: string;
  kind: AppetiteKind;
  day: string;
  /** HH:MM, if given. */
  time: string | null;
  /** For sickness only. */
  how: How | null;
  /** What was craved or gone off; null for sickness. */
  what: string | null;
  note: string | null;
  by: string | null;
  createdAt: string;
  editedBy: string | null;
  editedAt: string | null;
};

/** What a phone sends for a new or changed entry. */
export type AppetiteInput = { id: string; kind: AppetiteKind; day: string; time: string | null; how: How | null; what: string | null; note: string | null };

/** An entry as a phone sends it back changed: what was written, not who kept it or when. */
export function inputOf({ id, kind, day, time, how, what, note }: AppetiteInput): AppetiteInput {
  return { id, kind, day, time, how, what, note };
}

/** Words as kept: trimmed, and nothing at all rather than blank. */
function wordsOf(text: string | null): string | null {
  return text?.trim() || null;
}

/** An input as kept: `how` only for sickness, `what` only otherwise, words trimmed. */
export function tidy(input: AppetiteInput): AppetiteInput {
  const sick = input.kind === "sick";
  return { ...input, how: sick ? input.how : null, what: sick ? null : wordsOf(input.what), note: wordsOf(input.note) };
}

/** Whether an input makes sense: sickness says how bad, a craving or something gone off says what. */
export function isWhole(input: AppetiteInput): boolean {
  const t = tidy(input);
  return t.kind === "sick" ? t.how !== null : t.what !== null;
}

/** "Threw up", "Craving: pickles", "Gone off: coffee". */
export function describe(entry: Pick<AppetiteEntry, "kind" | "how" | "what">): string {
  if (entry.kind === "sick") return HOW_LABEL[entry.how ?? "queasy"];
  return `${entry.kind === "craving" ? "Craving" : "Gone off"}: ${entry.what ?? ""}`;
}

/** Newest first: by day, then time (one without a time before the timed ones that day), then when it was kept. */
export function latestFirst<E extends AppetiteEntry>(entries: readonly E[]): E[] {
  return [...entries].sort((a, b) => b.day.localeCompare(a.day) || (b.time ?? "").localeCompare(a.time ?? "") || b.createdAt.localeCompare(a.createdAt));
}

function sickness(entries: readonly AppetiteEntry[]): AppetiteEntry[] {
  return entries.filter((e) => e.kind === "sick" && e.how !== null);
}

/** Whether a sickness entry means being sick: threw up, or can't keep fluids down. */
function threwUp(e: AppetiteEntry): boolean {
  return e.how === "vomited" || e.how === "fluids";
}

/** Each day's worst sickness, by day. */
function worstByDay(entries: readonly AppetiteEntry[]): Map<ISODate, How> {
  const worst = new Map<ISODate, How>();
  for (const e of sickness(entries)) {
    const day = e.day as ISODate;
    const was = worst.get(day);
    if (!was || HOWS.indexOf(e.how!) > HOWS.indexOf(was)) worst.set(day, e.how!);
  }
  return worst;
}

/** Since when: the first day any sickness was kept, and the latest one. Null with none. */
export function sicknessSince(entries: readonly AppetiteEntry[]): { first: ISODate; last: AppetiteEntry } | null {
  const sick = latestFirst(sickness(entries));
  if (sick.length === 0) return null;
  return { first: sick.at(-1)!.day as ISODate, last: sick[0]! };
}

/** A run of seven days: a pregnancy week with a due date, else the seven days ending today, and the ones before. */
export type SickWeek = {
  start: ISODate;
  end: ISODate;
  /** Its week, before or after the pregnancy, or null with no due date. */
  place: Place | null;
  /** Each of its days, oldest first: the day's worst, null with none, and whether it's still to come. */
  days: { day: ISODate; worst: How | null; ahead: boolean }[];
  /** How many of its days had any sickness kept. */
  sickDays: number;
  /** How many of its days had threw up or worse. */
  threwUpDays: number;
};

/**
 * The weeks from the first sickness kept to today, newest first, a cell a
 * day: how often, and whether it's easing, shown rather than said. Aligned
 * to pregnancy weeks with a due date (the due date starts a week), and to
 * runs of seven days ending today without. Empty with no sickness kept.
 */
export function sicknessWeeks(entries: readonly AppetiteEntry[], today: ISODate, dueDate: ISODate | null): SickWeek[] {
  const since = sicknessSince(entries);
  if (!since) return [];
  const worst = worstByDay(entries);
  // A day that starts a run: the due date, or tomorrow, so today ends one.
  const anchor = dueDate ?? addDays(today, 1);
  const startOf = (day: ISODate) => addDays(day, -(((daysBetween(anchor, day) % 7) + 7) % 7));
  const from = startOf(since.first < today ? since.first : today);
  const weeks: SickWeek[] = [];
  for (let start = startOf(today); start >= from; start = addDays(start, -7)) {
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(start, i);
      return { day, worst: worst.get(day) ?? null, ahead: day > today };
    });
    weeks.push({
      start,
      end: addDays(start, 6),
      place: dueDate ? placeOf(start, dueDate) : null,
      days,
      sickDays: days.filter((d) => d.worst !== null).length,
      threwUpDays: days.filter((d) => d.worst === "vomited" || d.worst === "fluids").length,
    });
  }
  return weeks;
}

/** What "often" is: threw up on this many of the last this many days. A first guess, not a source's number. */
export const OFTEN = { days: 7, threwUp: 4 } as const;

/**
 * Whether she's been sick often lately: threw up (or worse) on at least four
 * of the last seven days. `severe-vomiting` says vomiting often is worth
 * contacting the midwife or doctor about; the four is ours. The days it
 * counted, or null.
 */
export function sickOften(entries: readonly AppetiteEntry[], today: ISODate): number | null {
  const from = addDays(today, 1 - OFTEN.days);
  const days = new Set(
    sickness(entries)
      .filter((e) => threwUp(e) && e.day >= from && e.day <= today)
      .map((e) => e.day)
  );
  return days.size >= OFTEN.threwUp ? days.size : null;
}

/** One thing craved, or gone off: as last written, how many times, and the first and last day. */
export type Tally = { what: string; times: number; first: ISODate; last: ISODate };

/** How a craving is matched: "Pickles" and " pickles " are the same. */
function keyOf(what: string): string {
  return what.trim().toLocaleLowerCase("en-AU").replace(/\s+/g, " ");
}

/** Everything craved (or gone off), most times first, then most recent: "pickles, 14 times". */
export function tally(entries: readonly AppetiteEntry[], kind: "craving" | "off"): Tally[] {
  const by = new Map<string, Tally>();
  // Oldest first, so the name kept is the latest spelling.
  for (const e of [...latestFirst(entries)].reverse()) {
    if (e.kind !== kind || !e.what) continue;
    const key = keyOf(e.what);
    const day = e.day as ISODate;
    const was = by.get(key);
    by.set(
      key,
      was
        ? { what: e.what, times: was.times + 1, first: was.first < day ? was.first : day, last: was.last > day ? was.last : day }
        : { what: e.what, times: 1, first: day, last: day }
    );
  }
  return [...by.values()].sort((a, b) => b.times - a.times || b.last.localeCompare(a.last));
}

/** How many past cravings are offered as one-tap chips. */
const CHIPS = 6;

/** The cravings to offer as chips, most often first: the second pickle is one tap. */
export function cravingChips(entries: readonly AppetiteEntry[], kind: "craving" | "off" = "craving"): string[] {
  return tally(entries, kind)
    .slice(0, CHIPS)
    .map((t) => t.what);
}

/**
 * Things that aren't food, whose craving (pica) `food-cravings-and-aversions`
 * says to mention to the midwife or doctor, as it's linked to low iron.
 * Matched as whole words, so "ice" but not "ice cream" or "iced coffee".
 */
const NOT_FOOD = [
  "ice",
  "ice cubes",
  "chalk",
  "clay",
  "dirt",
  "soil",
  "sand",
  "soap",
  "paper",
  "cardboard",
  "starch",
  "cornflour",
  "laundry starch",
  "ash",
  "ashes",
  "charcoal",
  "coal",
  "plaster",
  "paint",
  "rocks",
  "stones",
  "pebbles",
  "toothpaste",
  "baby powder",
  "talc",
  "talcum powder",
  "hair",
  "glue",
  "rust",
  "mud",
];

/** Whether a craving is for something that isn't food: the whole of what was written, or a word of it, with "ice" never followed by cream, lolly, etc. */
export function notFood(what: string): boolean {
  const said = keyOf(what)
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (NOT_FOOD.includes(said)) return true;
  const words = said.split(" ");
  return NOT_FOOD.some((thing) => {
    const parts = thing.split(" ");
    for (let i = 0; i + parts.length <= words.length; i++) {
      if (parts.every((p, j) => words[i + j] === p)) {
        // "ice cream", "ice block", "ice tea": ice that is food.
        const next = words[i + parts.length];
        if (thing === "ice" && next && ICE_FOODS.includes(next)) continue;
        return true;
      }
    }
    return false;
  });
}

/** What follows "ice" when it's food after all. */
const ICE_FOODS = ["cream", "creams", "block", "blocks", "lolly", "lollies", "tea", "coffee", "chocolate", "cake", "magic"];

/** A week's sickness and cravings, as the timeline says them: the days with any sickness, and the week's most kept craving. */
export function weekAppetite(entries: readonly AppetiteEntry[], week: Week, dueDate: ISODate | null): { sick: number; craved: string | null } {
  if (!dueDate) return { sick: 0, craved: null };
  const inWeek = entries.filter((e) => placeOf(e.day as ISODate, dueDate) === week);
  return { sick: worstByDay(inWeek).size, craved: tally(inWeek, "craving")[0]?.what ?? null };
}

/** The question for the appointment when she's been sick often: "I've been sick on 5 of the last 7 days, since 8 Sep. What can help?" */
export function oftenQuestion(days: number, since: string): string {
  return `I've been sick on ${days} of the last ${OFTEN.days} days, since ${since}. What can help?`;
}

/** The question for the appointment about craving something that isn't food. */
export function notFoodQuestion(what: string): string {
  return `I've been craving ${keyOf(what)}. Should my iron be checked?`;
}
