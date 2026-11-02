// What the Journal works out about now: the calls to make (a movement felt
// as different, can't keep fluids down), and the recaps there are to open.

import type { AppetiteEntry } from "./appetite";
import { addDays, type ISODate } from "./dates";
import type { JournalEntry } from "./journal";
import { TRIMESTERS } from "./story";
import { WEEKS, type Week } from "./timeline";

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

/** The recaps there are to open, at any time, from the ones done: each trimester ended, and the whole from week 37. */
export function recapsSoFar(now: Week | null): RecapSpan[] {
  if (now === null) return [];
  const spans: RecapSpan[] = TRIMESTERS.filter((t) => t.to < now).map((t) => ({ key: t.key, title: t.title, from: t.from, to: t.to }));
  return now >= WHOLE_FROM ? [...spans, WHOLE] : spans;
}
