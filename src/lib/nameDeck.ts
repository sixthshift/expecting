// The names game's deck: the names given often enough across the
// English-speaking West, from its registers of births (nameDeck.data.json,
// made by `bun run names`), and the order each of you meets them in. Kept apart from names.ts so the deck is only loaded with
// the game, never with the app.

import data from "./nameDeck.data.json";
import { type DeckFilter, type NameCard, type NamesView, settled } from "./names";

/** Mostly girls (`f`), mostly boys (`m`), or given to either (`u`). */
export type DeckSex = "f" | "m" | "u";

export type DeckName = {
  name: string;
  sex: DeckSex;
  /** Babies in a million given it lately, averaged over the sources, each counting the same. */
  perMillion: number;
  /** Its place in each source's latest top 100 (`DECK_PLACES`' order), 0 when not in it. */
  top: number[];
  /** The decade it was most given, as a share of that decade's births. */
  peak: number;
  /** Whether it's common in each source (`DECK_PLACES`' order): a decade at 1 in 10,000 babies there, or in its top 100. */
  common: boolean[];
};

/**
 * How many of the places a name must be common in to be dealt: a standard Western name, not one of one
 * place's own (Aroha in New Zealand, Seán in Ireland). The regional ones stay in the deck, with where
 * they're common, for dealing by region one day.
 */
export const WIDESPREAD = 2;

/** Whether a name is common in enough places to be dealt. */
export function widespread(d: DeckName): boolean {
  return d.common.filter(Boolean).length >= WIDESPREAD;
}

/** The registers the names come from, each a place ("Ireland") with its latest year. */
export const DECK_PLACES: readonly { id: string; place: string; latest: number }[] = data.sources;
/** Who to credit for them, as their licences ask. */
export const DECK_CREDIT: string = data.credit;

export const DECK: readonly DeckName[] = (data.names as [string, DeckSex, number, number[], number, number[]][]).map(
  ([name, sex, perMillion, top, peak, common]) => ({ name, sex, perMillion, top, peak, common: common.map((c) => c === 1) })
);

const byKey = new Map(DECK.map((d) => [d.name.toLowerCase(), d]));

/** The deck's own entry for a name, whatever its case. */
export function inDeck(name: string): DeckName | undefined {
  return byKey.get(name.trim().toLowerCase());
}

function deals(filter: DeckFilter, sex: DeckSex): boolean {
  return filter === "all" || sex === "u" || sex === (filter === "girls" ? "f" : "m");
}

/** Where in a whole deck's shuffle the first few dozen fall. */
const EARLY = 0.005;

/** A name to vote on: the row it already has (`id`), and what the deck knows of it. */
export type DeckCard = { name: string; id: string | null; deck: DeckName | null };

/**
 * The names still to vote on, in the order this person meets them. First the names the other added,
 * oldest first, as they asked for them. Then the deck, shuffled by a seed (the person's id, so the order
 * is the same each time they look, and different from the other's), with the familiar names a little
 * likelier near the front, so the first cards aren't all rarities. A name the other liked from the deck
 * is shuffled in near the front too, so a match comes sooner; it isn't put first, which would tell you
 * what they liked. Only the standard Western names are dealt (`widespread`), but a regional one the
 * other liked is too. The filter keeps a deck name of the other sex out; a name the deck doesn't know is
 * always dealt.
 */
export function upNext(view: NamesView, seed: string, filter: DeckFilter): DeckCard[] {
  // A name already on the shortlist, or taken off it, is settled: nobody is dealt it again.
  const done = settled(view);
  const voted = new Set([...done, ...view.names.filter((n) => n.mine !== null).map((n) => n.name.toLowerCase())]);
  const waiting = view.names.filter((n) => n.mine === null && !done.has(n.name.toLowerCase()));
  const added: DeckCard[] = waiting.filter((n) => !n.deck).map((n) => ({ name: n.name, id: n.id, deck: inDeck(n.name) ?? null }));
  const liked = new Map(waiting.filter((n) => n.deck).map((n): [string, NameCard] => [n.name.toLowerCase(), n]));
  const first = new Set(added.map((c) => c.name.toLowerCase()));

  const shuffled = DECK.filter((d) => deals(filter, d.sex) && (widespread(d) || liked.has(d.name.toLowerCase())))
    .map((d) => {
      const key = d.name.toLowerCase();
      // Efraimidis–Spirakis: a weighted shuffle, ascending by -ln(u)/weight.
      const weight = 1 + Math.log1p(d.perMillion / 100) + (d.top.some((p) => p > 0) ? 1 : 0);
      // A name the other liked takes a place among the first few dozen of a whole deck, and comes nearer as you vote.
      const at = liked.has(key) ? unit(`${seed}:${key}:liked`) * EARLY : -Math.log(unit(`${seed}:${key}`)) / weight;
      return { d, key, at };
    })
    .filter(({ key }) => !voted.has(key) && !first.has(key))
    .sort((a, b) => a.at - b.at)
    .map(({ d, key }): DeckCard => ({ name: d.name, id: liked.get(key)?.id ?? null, deck: d }));
  return [...added.filter((c) => c.deck === null || deals(filter, c.deck.sex)), ...shuffled];
}

/** A number in (0, 1) from a string: FNV-1a, so the shuffle is the same on every phone and every load. */
function unit(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) + 1) / 2 ** 32;
}

/**
 * One line on a name's card: where it's in the top 10 or 100 now, or the decade it was most given, or how
 * many babies are given it now. Nothing for a name the deck doesn't know.
 */
export function aboutName(d: DeckName | null): string | null {
  if (!d) return null;
  const within = (n: number) => DECK_PLACES.filter((_, i) => d.top[i]! > 0 && d.top[i]! <= n).map((p) => p.place);
  if (within(10).length > 0) return `Top 10 in ${listOf(within(10))}`;
  if (within(100).length > 0) return `Top 100 in ${listOf(within(100))}`;
  if (d.peak < 1990) return `Most given in the ${d.peak}s`;
  if (d.perMillion >= 5) return `About 1 in ${roughly(1_000_000 / d.perMillion).toLocaleString("en-AU")} babies now`;
  return "Rare now";
}

/** "A", "A and B", "A, B and C". */
function listOf(places: string[]): string {
  return places.length < 2 ? (places[0] ?? "") : `${places.slice(0, -1).join(", ")} and ${places.at(-1)}`;
}

/** To two figures: 2,437 as 2,400. */
function roughly(n: number): number {
  const scale = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / scale) * scale;
}

/** Whose name it mostly is, for a card dealt from all of them. */
export const SEX_LABEL: Record<DeckSex, string> = { f: "Girl", m: "Boy", u: "Either" };
