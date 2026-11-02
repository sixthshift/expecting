import { addDays, daysBetween, type ISODate } from "../../dates";
import { dayInSentence, placeInSentence } from "../../labels";
import type { AppetiteEntry } from "../appetite";
import { placeOf } from "../journal";
import { LATELY_DAYS, list, type Summary } from "./summary";

/** A gap longer than this between sick days starts a new spell. */
const SPELL_GAP_DAYS = 14;

/** "1 day", "5 days". */
function dayCount(n: number): string {
  return n === 1 ? "1 day" : `${n} days`;
}

/** Where a run of days falls: "in week 9", "from week 6 to week 13", or by date without a due date. */
function span(first: ISODate, last: ISODate, dueDate: ISODate | null): string {
  const a = placeInSentence(first, dueDate);
  const b = placeInSentence(last, dueDate);
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
export function sicknessSummary(appetite: readonly AppetiteEntry[], today: ISODate, dueDate: ISODate | null): Summary | null {
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
  if (lately > 0) lines.push(`Last kept ${dayInSentence(last, today)}.`);
  const headline = lately > 0 ? `${lately} of the last ${LATELY_DAYS} days` : `None since ${placeInSentence(last, dueDate)}`;
  return { headline, lines, lately: lately > 0 };
}
