// The names game, as one person sees it: the names in play, their own vote on
// each, and the matches (names everyone likes). Never anyone else's votes. The
// deck the rest come from is nameDeck.ts.

/**
 * A name in play, with this person's own vote: liked, passed, or not yet. `deck` is a name from the deck
 * rather than one either of you added: it is in play once someone has voted on it, and shown to you only
 * once you have, or the other liked it.
 */
export type NameCard = { id: string; name: string; mine: boolean | null; deck: boolean };

/** A name on the shortlist; `star` when a superlike put it there (never whose). */
export type Shortlisted = { id: string; name: string; star: boolean };

export type NamesView = {
  names: NameCard[];
  /** Names you both like, and names either of you superliked, in the order they were added; none taken off. */
  shortlist: Shortlisted[];
  /** Names taken off the shortlist: out of the game, and not dealt again. */
  off: { id: string; name: string }[];
  /** This person's latest superlike: the name, and the phone's date it was used. One a day. */
  superliked: { name: string; on: ISODate } | null;
  /** Whether there's someone to match with yet. */
  together: boolean;
};

/** Whether this person's superlike for `today` is still there to use. */
export function superlikeLeft(view: NamesView, today: ISODate): boolean {
  return view.superliked?.on !== today;
}

/** Names never to deal again: those on the shortlist, and those taken off it. */
export function settled(view: NamesView): Set<string> {
  return new Set([...view.shortlist, ...view.off].map((n) => n.name.toLowerCase()));
}

import type { ISODate } from "./dates";
import type { Baby } from "./theme";

/** Which names the deck deals: girls' (and either), boys' (and either), or all of them. Here, not in nameDeck.ts, so a route can name them without loading the deck. */
export const DECK_FILTERS = ["girls", "boys", "all"] as const;
export type DeckFilter = (typeof DECK_FILTERS)[number];

/**
 * The deck to deal, from the one question Expecting asks (the colours): knowing it's a girl or a boy,
 * that one's names, with no choosing the other's; not knowing, what was chosen, all of them until then.
 */
export function dealing(baby: Baby, chosen: DeckFilter | undefined): { filter: DeckFilter; choosable: boolean } {
  if (baby === "girl") return { filter: "girls", choosable: false };
  if (baby === "boy") return { filter: "boys", choosable: false };
  return { filter: chosen ?? "all", choosable: true };
}

/** A name as typed, tidied: trimmed, single-spaced, and each word capitalised if it was typed in lower case. */
export function tidyName(typed: string): string {
  const name = typed.trim().replace(/\s+/g, " ");
  return name === name.toLowerCase() ? name.replace(/(^|[\s'-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase()) : name;
}
