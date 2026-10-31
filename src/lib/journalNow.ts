// What the Journal shows first: a few cards, chosen by fixed rules in a fixed
// order, so nothing jumps about. A call to make always comes first and isn't
// counted; then at most two of: what you just kept, what the other one kept
// since you looked, a first to claim, a recap, last week kept, and this day
// some weeks ago. While something has happened, only a call.

import type { AppetiteEntry } from "./appetite";
import { addDays, daysBetween, type ISODate } from "./dates";
import type { Suggestion } from "./firsts";
import type { JournalEntry } from "./journal";
import { placeOf } from "./journal";
import type { Person } from "./people";
import { type StoryItem, TRIMESTERS } from "./story";
import { type Position, WEEKS, type Week } from "./timeline";

/** At most this many cards, beside a call. */
const NOW_CARDS = 2;

/** How long a movement felt as different keeps the call on the Journal: today and yesterday. */
const CHANGED_DAYS = 2;

/** The calls to make: a movement felt as slower, weaker or stopped lately, or can't keep fluids down today. */
export function callsToMake(journal: readonly JournalEntry[], appetite: readonly AppetiteEntry[], today: ISODate): { moved: boolean; fluids: boolean } {
  const from = addDays(today, 1 - CHANGED_DAYS);
  return {
    moved: journal.some((e) => e.kind === "movement" && e.different && e.day >= from && e.day <= today),
    fluids: appetite.some((e) => e.kind === "sick" && e.how === "fluids" && e.day === today),
  };
}

/** A recap to open: a trimester's, or the whole pregnancy's. */
export type RecapSpan = { key: string; title: string; from: Week; to: Week };

export const WHOLE: RecapSpan = { key: "whole", title: "Your pregnancy", from: WEEKS.first, to: WEEKS.last };

/** The whole pregnancy's recap is offered from this week. */
const WHOLE_FROM: Week = 37;

/** The recap there is now: the whole pregnancy's from week 37, a trimester's in the week after it ends. */
export function recapDue(now: Week | null): RecapSpan | null {
  if (now === null) return null;
  if (now >= WHOLE_FROM) return WHOLE;
  const ended = TRIMESTERS.find((t) => t.to === now - 1);
  return ended ? { key: ended.key, title: ended.title, from: ended.from, to: ended.to } : null;
}

/** The recaps there are to open, at any time, from the ones done: each trimester ended, and the whole from week 37. */
export function recapsSoFar(now: Week | null): RecapSpan[] {
  if (now === null) return [];
  const spans: RecapSpan[] = TRIMESTERS.filter((t) => t.to < now).map((t) => ({ key: t.key, title: t.title, from: t.from, to: t.to }));
  return now >= WHOLE_FROM ? [...spans, WHOLE] : spans;
}

export type NowCard =
  | { kind: "kept"; item: StoryItem }
  | { kind: "since"; people: Person[]; items: StoryItem[] }
  | { kind: "first"; suggestion: Suggestion }
  | { kind: "recap"; span: RecapSpan }
  | { kind: "lastWeek"; week: Week; items: StoryItem[] }
  | { kind: "weeksAgo"; weeks: number; item: StoryItem };

/** "Last week, kept" shows in the first days of a week: these many. */
const LAST_WEEK_DAYS = 2;

/** "This day, weeks ago" looks back at least this many weeks. */
const WEEKS_AGO_FROM = 2;

/** What "this day, weeks ago" can bring back, most wanted first. */
const AGO: readonly StoryItem["kind"][] = ["first", "photo", "letter", "note"];

/**
 * The Journal's cards, in their order, at most two. `kept`, what the "+" just
 * kept (from the address); `seen`, when this phone's person last opened the
 * Journal (null: never, or no one holding it); `me`, who that is.
 */
export function nowCards({
  items,
  kept,
  seen,
  me,
  people,
  suggestions,
  today,
  position,
  dueDate,
  quiet,
  recapsOpened,
  recapHas = () => true,
}: {
  items: readonly StoryItem[];
  kept: StoryItem | null;
  seen: string | null;
  me: Person | null;
  people: readonly Person[];
  suggestions: readonly Suggestion[];
  today: ISODate;
  position: Position | null;
  dueDate: ISODate | null;
  quiet: boolean;
  /** The recaps this phone has opened: one opened isn't offered again. */
  recapsOpened: readonly string[];
  /** Whether a recap has anything in it: one with nothing kept or done isn't offered. */
  recapHas?: (span: RecapSpan) => boolean;
}): NowCard[] {
  if (quiet) return [];
  const cards: NowCard[] = [];
  if (kept) cards.push({ kind: "kept", item: kept });

  // What the other one kept since you looked: not what was done (that's no one's), and not a feeling (that's theirs to tell).
  if (me && seen && people.length > 1) {
    const theirs = items.filter((i) => i.by !== null && i.by !== me.id && i.createdAt > seen && i.kind !== "feeling" && i.kind !== "done");
    const who = people.filter((p) => theirs.some((i) => i.by === p.id));
    if (theirs.length > 0) cards.push({ kind: "since", people: who, items: theirs });
  }

  const suggestion = suggestions[0];
  if (suggestion) cards.push({ kind: "first", suggestion });

  const now = position?.week ?? null;
  const recap = recapDue(now);
  if (recap && !recapsOpened.includes(recap.key) && recapHas(recap)) cards.push({ kind: "recap", span: recap });

  if (position && dueDate && now !== null && now > WEEKS.first && position.gestationDays % 7 < LAST_WEEK_DAYS) {
    const last = now - 1;
    const these = items.filter((i) => placeOf(i.day, dueDate) === last);
    if (these.length > 0) cards.push({ kind: "lastWeek", week: last, items: these });
  }

  const ago = items
    .filter((i) => AGO.includes(i.kind))
    .flatMap((item) => {
      const days = daysBetween(item.day, today);
      return days > 0 && days % 7 === 0 && days / 7 >= WEEKS_AGO_FROM ? [{ item, weeks: days / 7 }] : [];
    })
    .sort((a, b) => a.weeks - b.weeks || AGO.indexOf(a.item.kind) - AGO.indexOf(b.item.kind))[0];
  if (ago) cards.push({ kind: "weeksAgo", weeks: ago.weeks, item: ago.item });

  return cards.slice(0, NOW_CARDS);
}
