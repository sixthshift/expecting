// It's time: the page for the day it starts (docs/product/its-time.md). A start
// is one go at it: opened when the waters break or the contractions start,
// ended "We're there" or "False alarm, we're home". Its contractions are timed
// by either phone; its last things are ticked for it alone. Nothing here
// judges the numbers: the birth suite does that.

import type { Facts } from "../features/settings/model/facts";
import { addDays, type ISODate, todayISO } from "./dates";
import { formatTime, timeNow } from "./journal";
import type { Week } from "./timeline";

/** The colour of the waters, as `card-waters-colour` sorts it; unsure is fine too. */
export const WATERS = ["clear", "green-brown-blood", "unsure"] as const;
export type Waters = (typeof WATERS)[number];

export const WATERS_LABEL: Record<Waters, string> = {
  clear: "Clear, pink or straw-coloured",
  "green-brown-blood": "Green, brown or blood-coloured",
  unsure: "Not sure, or can't tell",
};

/** How a start ended. */
export const ENDINGS = ["there", "home"] as const;
export type Ending = (typeof ENDINGS)[number];

export type Contraction = { id: string; startedAt: string; endedAt: string | null; note: string | null; by: string | null };

export type Start = {
  id: string;
  startedAt: string;
  by: string | null;
  /** When the waters broke (or might have), and what colour (null until it's said); both null while they haven't. */
  watersAt: string | null;
  waters: Waters | null;
  /** When you set off. */
  leftAt: string | null;
  endedAt: string | null;
  ended: Ending | null;
  /** Oldest first. */
  contractions: Contraction[];
  /** The last things ticked for this start, by key. */
  ticks: string[];
};

/** A last thing of your own, kept between starts: "Turn the heater off". */
export type StartLine = { id: string; title: string; by: string | null; createdAt: string };

export type ItsTime = { starts: Start[]; lines: StartLine[] };

/** The longest a contraction's few words or an own line may be. */
export const WORDS_MAX = 200;

/** The start under way, if any: the newest not yet ended. */
export function openStart(data: ItsTime): Start | null {
  return data.starts.find((s) => s.endedAt === null) ?? null;
}

/** The week It's time shows from: 36, or 32 with twins or more, as they're more often early. */
export function shownFrom(facts: Facts): Week {
  return facts.babies === "twins" || facts.babies === "more" ? 32 : 36;
}

/** Whether the way to It's time is drawn beside Emergency info: from its week, or while a start is under way; never while something has happened. */
export function itsTimeShown({ now, facts, quiet, open }: { now: Week | null; facts: Facts; quiet: boolean; open: boolean }): boolean {
  if (quiet) return false;
  if (open) return true;
  return now !== null && now >= shownFrom(facts);
}

const ms = (iso: string) => new Date(iso).getTime();

/** Seconds from one time to another, rounded. */
function seconds(from: string, to: string): number {
  return Math.round((ms(to) - ms(from)) / 1000);
}

/** What the midwife asks (`timing-contractions`): how often, start to start; how long; and how many in the last 10 minutes. No verdict. */
export type Pattern = {
  /** Minutes between starts over the last hour, lowest and highest, rounded; null with fewer than two. */
  every: { min: number; max: number } | null;
  /** Seconds each lasted over the last hour, rounded to 5, typical (the median); null with none finished. */
  lasting: number | null;
  /** Started in the last 10 minutes. */
  inTen: number;
  /** Started in the last hour. */
  inHour: number;
};

const HOUR = 3_600_000;
const TEN = 600_000;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** The pattern of the contractions up to `now`. */
export function patternOf(contractions: readonly Contraction[], now: Date): Pattern {
  const t = now.getTime();
  const hour = contractions.filter((c) => t - ms(c.startedAt) <= HOUR && ms(c.startedAt) <= t);
  const gaps: number[] = [];
  for (let i = 1; i < hour.length; i++) gaps.push((ms(hour[i]!.startedAt) - ms(hour[i - 1]!.startedAt)) / 60_000);
  const lasted = hour.flatMap((c) => (c.endedAt ? [seconds(c.startedAt, c.endedAt)] : []));
  return {
    every: gaps.length ? { min: Math.max(1, Math.round(Math.min(...gaps))), max: Math.max(1, Math.round(Math.max(...gaps))) } : null,
    lasting: lasted.length ? Math.round(median(lasted) / 5) * 5 : null,
    inTen: hour.filter((c) => t - ms(c.startedAt) <= TEN).length,
    inHour: hour.length,
  };
}

/** The pattern as said on the phone: "every 4–5 min, about 50 s". Null with nothing to say. */
export function sayPattern(p: Pattern): string | null {
  const parts = [
    p.every ? `every ${p.every.min === p.every.max ? p.every.min : `${p.every.min}–${p.every.max}`} min` : null,
    p.lasting !== null ? `about ${p.lasting} s` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

/** How long one lasted, "55 s" or "1 min 10 s"; null while it's still going. */
export function lasted(c: Contraction): string | null {
  if (!c.endedAt) return null;
  const s = Math.max(0, seconds(c.startedAt, c.endedAt));
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ""}`;
}

/** A time of day as the phone shows it, "2:14 am". */
export function clock(iso: string): string {
  return formatTime(timeNow(new Date(iso)));
}

/** The day a time falls on, on this phone. */
export function dayOf(iso: string): ISODate {
  return todayISO(new Date(iso));
}

/** The ways a start is read back: the false starts before it are folded into a real one's line. */
export type Night = { start: Start; falseStarts: Start[] };

/**
 * The starts that ended "We're there", newest first, each with the false
 * alarms kept since the one before. A false alarm on its own, or one still
 * under way, isn't in the story.
 */
export function nightsOf(starts: readonly Start[]): Night[] {
  const oldest = [...starts].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const nights: Night[] = [];
  let waiting: Start[] = [];
  for (const s of oldest) {
    if (s.ended === "home") waiting.push(s);
    else if (s.ended === "there") {
      nights.push({ start: s, falseStarts: waiting });
      waiting = [];
    }
  }
  return nights.reverse();
}

/** "Tue", or "Tue 3 Nov" when it's more than a week before `day`. */
function shortDay(of: ISODate, day: ISODate): string {
  const d = new Date(`${of}T12:00:00`);
  const week = of >= addDays(day, -6);
  return d.toLocaleDateString("en-AU", week ? { weekday: "short" } : { weekday: "short", day: "numeric", month: "short" });
}

/** The night's line in the story: its times only, each when it was kept. "Waters broke 2:14 am (clear) · timing from 2:30 am · left 3:05 am · there 3:40 am". */
export function nightLine({ start, falseStarts }: Night): string {
  const first = start.contractions[0];
  const parts = [
    start.watersAt ? `Waters broke ${clock(start.watersAt)}${start.waters === "clear" ? " (clear)" : ""}` : null,
    first ? `timing from ${clock(first.startedAt)}` : null,
    start.leftAt ? `left ${clock(start.leftAt)}` : null,
    start.endedAt ? `there ${clock(start.endedAt)}` : null,
  ].filter((p): p is string => p !== null);
  if (!start.watersAt && !first) parts.unshift(`Started ${clock(start.startedAt)}`);
  const line = parts.join(" · ");
  const sentence = line.charAt(0).toUpperCase() + line.slice(1);
  if (falseStarts.length === 0) return sentence;
  const day = dayOf(start.startedAt);
  const falses = falseStarts.map((f) => shortDay(dayOf(f.startedAt), day));
  return `${sentence}, after ${falseStarts.length === 1 ? "a false start" : "false starts"} on ${falses.join(" and ")}`;
}

/** Pregnancy weeks under 37: the page opens with the call and going in (`signs-of-preterm-labour`). */
export const TERM_WEEK: Week = 37;
