// What the household has chosen of the extras (src/features/settings/model/extras.data.ts): which are
// on, and which This week should offer. Pure, tested apart from the screen.

import { EXTRAS, type Extra } from "../features/settings/model/extras";
import { applies, type Facts } from "../features/settings/model/facts";
import type { Week } from "./timeline";

/** One extra someone turned on or off. No choice is undecided. */
export type Choice = { id: string; on: boolean; changedBy: string | null; changedAt: string };

/** The extras turned on: an extra nobody has chosen is off. */
export function extrasOn(choices: readonly Choice[]): Set<string> {
  return new Set(choices.filter((c) => c.on && EXTRAS.some((e) => e.id === c.id)).map((c) => c.id));
}

/** Whether something belonging to `extra` (or to none) is shown. */
export function inExtras(extra: string | null, on: ReadonlySet<string>): boolean {
  return extra === null || on.has(extra);
}

/** The extras this household is offered: those whose `when` its answers fit, and any already on. */
export function extrasFor(facts: Facts, on: ReadonlySet<string> = new Set()): Extra[] {
  return EXTRAS.filter((e) => on.has(e.id) || applies(e.when, facts));
}

/** The extra This week offers: the first it's offered that nobody has decided on, whose week has come. */
export function extraToOffer(choices: readonly Choice[], now: Week, facts: Facts = {}): Extra | undefined {
  const decided = new Set(choices.map((c) => c.id));
  return extrasFor(facts).find((e) => !decided.has(e.id) && now >= e.offer);
}
