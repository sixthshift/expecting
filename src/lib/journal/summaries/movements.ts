import { addDays, formatTime, type ISODate } from "../../dates";
import { dayInSentence, placeInSentence } from "../../labels";
import type { JournalEntry } from "../journal";
import { LATELY_DAYS, list, type Summary } from "./summary";

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
export function movementsSummary(journal: readonly JournalEntry[], today: ISODate, dueDate: ISODate | null): Summary | null {
  const kept = journal.filter((e) => e.kind === "movement" && e.day <= today).sort((a, b) => (a.day + (a.time ?? "")).localeCompare(b.day + (b.time ?? "")));
  if (kept.length === 0) return null;
  const from = addDays(today, 1 - LATELY_DAYS);
  const lately = kept.filter((e) => e.day >= from);
  const lines: string[] = [];
  const days = new Set(lately.map((e) => e.day)).size;
  // Felt as different comes first: it's the one the midwife needs to hear.
  const different = lately.filter((e) => e.different).map((e) => dayInSentence(e.day as ISODate, today));
  if (different.length > 0) lines.push(`Felt as slower, weaker or stopped ${list([...new Set(different)])}.`);
  const timed = lately.flatMap((e) => (e.time ? [partOf(e.time)] : []));
  if (timed.length >= 3) {
    const counts = new Map<string, number>();
    for (const p of timed) counts.set(p, (counts.get(p) ?? 0) + 1);
    const usual = [...new Set(PARTS.map((p) => p.name))].filter((p) => (counts.get(p) ?? 0) / timed.length >= 0.25);
    if (usual.length > 0 && usual.length < 4) lines.push(`Usually in ${list(usual)}.`);
  }
  const last = kept.at(-1)!;
  lines.push(`Last kept ${dayInSentence(last.day as ISODate, today)}${last.time ? `, ${formatTime(last.time)}` : ""}.`);
  lines.push(`First kept in ${placeInSentence(kept[0]!.day as ISODate, dueDate)}.`);
  const headline = days > 0 ? `${days} of the last ${LATELY_DAYS} days` : `None in the last ${LATELY_DAYS} days`;
  return { headline, lines, lately: days > 0 };
}
