// The records: what's been kept, said in a few lines, for looking up rather
// than reading back. The answer to the midwife's "since when?", "how
// often?", "is it easing?", from what's kept and nothing else: counts, days
// and weeks, never "normal", never a score, never what's missing (a kind
// with nothing kept has no record). See docs/product/journal.md, The records.

import { type AppetiteEntry, tally } from "./appetite";
import { addDays, daysBetween, formatDate, type ISODate } from "./dates";
import { type Feeling, feelingsOf, isOwn, type OwnFeeling, STEP_LABEL, weekStep, wordsUsed } from "./feelings";
import { formatTime, type JournalEntry, placeOf } from "./journal";
import { weekLabel } from "./timeline";

/** The kinds kept as records, in the order they're shown. */
export const RECORDS = ["movements", "appetite", "feelings", "papers"] as const;
export type RecordKind = (typeof RECORDS)[number];

export const RECORD_LABEL: Record<RecordKind, string> = {
  movements: "Movements",
  appetite: "Sickness & cravings",
  feelings: "Feelings",
  papers: "Papers",
};

/**
 * A kind's record: the answer, short enough to read across a room
 * (`headline`), what backs it up (`lines`), and whether any of it is from
 * the last fortnight (`lately`): the records put what's going on now first.
 */
export type KeptRecord = { headline: string; lines: string[]; lately: boolean };

/** How far back "lately" looks, today among them. */
export const LATELY_DAYS = 14;

/** How far back feelings look, today among them. */
const FEELING_DAYS = 28;

/** "today", "yesterday", or "Sat 31 Oct". */
function dayWord(day: ISODate, today: ISODate): string {
  const ago = daysBetween(day, today);
  if (ago === 0) return "today";
  if (ago === 1) return "yesterday";
  return formatDate(day, { weekday: "short", day: "numeric", month: "short" });
}

/** "week 12", or with no due date the day. */
function whenWord(day: ISODate, dueDate: ISODate | null): string {
  if (!dueDate) return formatDate(day, { day: "numeric", month: "short" });
  const place = placeOf(day, dueDate);
  if (place === "before") return "before the pregnancy";
  if (place === "after") return "after week 42";
  return weekLabel(place).toLowerCase();
}

/** "3 times", "twice", "once". */
function times(n: number): string {
  return n === 1 ? "once" : n === 2 ? "twice" : `${n} times`;
}

/** "a, b and c". */
function list(words: readonly string[]): string {
  return words.length <= 1 ? (words[0] ?? "") : `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

/** The parts of the day a time falls in. */
const PARTS = [
  { name: "the night", from: 0, to: 5 },
  { name: "the morning", from: 5, to: 12 },
  { name: "the afternoon", from: 12, to: 17 },
  { name: "the evening", from: 17, to: 22 },
  { name: "the night", from: 22, to: 24 },
] as const;

function partOf(time: string): string {
  const hour = Number(time.slice(0, 2));
  return PARTS.find((p) => hour >= p.from && hour < p.to)!.name;
}

/**
 * Movements: how many of the last fortnight's days have one; any felt as
 * different lately, the parts of the day they're kept in (any with at least
 * a quarter of them), the last, and since when. Null with none kept.
 */
export function movementsRecord(journal: readonly JournalEntry[], today: ISODate, dueDate: ISODate | null): KeptRecord | null {
  const kept = journal.filter((e) => e.kind === "movement" && e.day <= today).sort((a, b) => (a.day + (a.time ?? "")).localeCompare(b.day + (b.time ?? "")));
  if (kept.length === 0) return null;
  const from = addDays(today, 1 - LATELY_DAYS);
  const lately = kept.filter((e) => e.day >= from);
  const lines: string[] = [];
  const days = new Set(lately.map((e) => e.day)).size;
  // Felt as different comes first: it's the one the midwife needs to hear.
  const different = lately.filter((e) => e.different).map((e) => dayWord(e.day as ISODate, today));
  if (different.length > 0) lines.push(`Felt as slower, weaker or stopped ${list([...new Set(different)])}.`);
  const timed = lately.flatMap((e) => (e.time ? [partOf(e.time)] : []));
  if (timed.length >= 3) {
    const counts = new Map<string, number>();
    for (const p of timed) counts.set(p, (counts.get(p) ?? 0) + 1);
    const usual = [...new Set(PARTS.map((p) => p.name))].filter((p) => (counts.get(p) ?? 0) / timed.length >= 0.25);
    if (usual.length > 0 && usual.length < 4) lines.push(`Usually in ${list(usual)}.`);
  }
  const last = kept.at(-1)!;
  lines.push(`Last kept ${dayWord(last.day as ISODate, today)}${last.time ? `, ${formatTime(last.time)}` : ""}.`);
  lines.push(`First kept in ${whenWord(kept[0]!.day as ISODate, dueDate)}.`);
  const headline = days > 0 ? `${days} of the last ${LATELY_DAYS} days` : `None in the last ${LATELY_DAYS} days`;
  return { headline, lines, lately: days > 0 };
}

/** A gap longer than this between sick days starts a new spell. */
const SPELL_GAP_DAYS = 14;

/** "1 day", "5 days". */
function dayCount(n: number): string {
  return n === 1 ? "1 day" : `${n} days`;
}

/** Where a run of days falls: "in week 9", "from week 6 to week 13", or by date without a due date. */
function span(first: ISODate, last: ISODate, dueDate: ISODate | null): string {
  const a = whenWord(first, dueDate);
  const b = whenWord(last, dueDate);
  return a === b ? `in ${a}` : `from ${a} to ${b}`;
}

/** Weeks said as a run where they run on: "week 9", "weeks 8 to 10", "week 8 and week 11". */
function weeksSaid(weeks: readonly number[]): string {
  const sorted = [...weeks].sort((a, b) => a - b);
  const runOn = sorted.every((w, i) => i === 0 || w === sorted[i - 1]! + 1);
  if (sorted.length > 1 && runOn) return `weeks ${sorted[0]} to ${sorted.at(-1)}`;
  return list(sorted.map((w) => `week ${w}`));
}

/**
 * Sickness: each spell (sick days with no gap of more than a fortnight),
 * how many days and from when to when; the week or weeks with the most;
 * how many days threw up or couldn't keep fluids down. Its answer: how many
 * of the last fortnight's days, or none since when. Null with none kept.
 */
export function sicknessRecord(appetite: readonly AppetiteEntry[], today: ISODate, dueDate: ISODate | null): KeptRecord | null {
  const sick = appetite.filter((e) => e.kind === "sick" && e.day <= today);
  if (sick.length === 0) return null;
  const days = [...new Set(sick.map((e) => e.day))].sort() as ISODate[];
  const spells: ISODate[][] = [];
  for (const day of days) {
    const spell = spells.at(-1);
    if (spell && daysBetween(spell.at(-1)!, day) <= SPELL_GAP_DAYS) spell.push(day);
    else spells.push([day]);
  }
  const lines = spells.map((spell, i) => `${i === 0 ? "Kept" : "Again"} on ${dayCount(spell.length)}, ${span(spell[0]!, spell.at(-1)!, dueDate)}.`);
  if (dueDate) {
    const byWeek = new Map<number, number>();
    for (const day of days) {
      const place = placeOf(day, dueDate);
      if (typeof place === "number") byWeek.set(place, (byWeek.get(place) ?? 0) + 1);
    }
    const most = Math.max(0, ...byWeek.values());
    const weeks = [...byWeek].filter(([, n]) => n === most).map(([w]) => w);
    if (byWeek.size > 1 && most > 1 && weeks.length <= 3) lines.push(`Most in ${weeksSaid(weeks)}: ${dayCount(most)}${weeks.length > 1 ? " each" : ""}.`);
  }
  const threw = new Set(sick.filter((e) => e.how === "vomited" || e.how === "fluids").map((e) => e.day)).size;
  if (threw > 0) lines.push(`Threw up on ${dayCount(threw)}.`);
  const fluids = new Set(sick.filter((e) => e.how === "fluids").map((e) => e.day)).size;
  if (fluids > 0) lines.push(`Couldn't keep fluids down on ${dayCount(fluids)}.`);
  const last = days.at(-1)!;
  const lately = days.filter((d) => d >= addDays(today, 1 - LATELY_DAYS)).length;
  if (lately > 0) lines.push(`Last kept ${dayWord(last, today)}.`);
  const headline = lately > 0 ? `${lately} of the last ${LATELY_DAYS} days` : `None since ${whenWord(last, dueDate)}`;
  return { headline, lines, lately: lately > 0 };
}

/** How many cravings are named before "and N more". */
const CRAVINGS_NAMED = 6;

/** Cravings and what's gone off: each by how often, most first; its answer, the most craved. Null with neither kept. */
export function cravingsRecord(appetite: readonly AppetiteEntry[], today: ISODate): KeptRecord | null {
  const craved = tally(appetite, "craving");
  const off = tally(appetite, "off");
  if (craved.length === 0 && off.length === 0) return null;
  const say = (t: { what: string; times: number }) => (t.times > 1 ? `${t.what.trim()} (${times(t.times)})` : t.what.trim());
  const lines: string[] = [];
  if (craved.length > 0) {
    const named = craved.slice(0, CRAVINGS_NAMED).map(say);
    const more = craved.length - named.length;
    lines.push(`Craved: ${list(more > 0 ? [...named, `${more} more`] : named)}.`);
  }
  if (off.length > 0) lines.push(`Gone off: ${list(off.map(say))}.`);
  // The most craved, all of them when they tie: "Ice and pickles".
  const most = craved.filter((t) => t.times === craved[0]?.times).slice(0, 3);
  const headline =
    most.length > 0
      ? list(most.map((t, i) => (i === 0 ? t.what.trim().replace(/^./, (c) => c.toUpperCase()) : t.what.trim().toLowerCase())))
      : `Gone off ${off[0]!.what.trim().toLowerCase()}`;
  const lately = appetite.some((e) => e.kind !== "sick" && e.day >= addDays(today, 1 - LATELY_DAYS) && e.day <= today);
  return { headline, lines, lately };
}

/** A person, as a feeling's record names them. */
export type Named = { id: string; name: string };

/**
 * Feelings over the last four weeks: for each of you who checked in, how
 * many days and the middle step; your own words most used, which only your
 * phone has. Null with none kept in that time.
 */
export function feelingsRecord(feelings: readonly (Feeling | OwnFeeling)[], people: readonly Named[], me: string | null, today: ISODate): KeptRecord | null {
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

/** A record as it's read out or pasted: its name, its answer, then each line. */
export type Titled = { title: string; record: KeptRecord };

/**
 * The records as plain text, to paste into a message or a form: a heading
 * (when, and the week), then each with its answer and lines, and the
 * papers by name. What's said is what's on the page, nothing more.
 */
export function recordsText({ heading, records, papers }: { heading: string; records: readonly Titled[]; papers: readonly string[] }): string {
  const parts = [heading, ...records.map(({ title, record }) => [`${title}: ${record.headline}`, ...record.lines.map((l) => `- ${l}`)].join("\n"))];
  if (papers.length > 0) parts.push(["Papers kept", ...papers.map((p) => `- ${p}`)].join("\n"));
  return parts.join("\n\n");
}
