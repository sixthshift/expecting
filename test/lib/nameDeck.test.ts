import { expect, test } from "vitest";
import { aboutName, DECK, DECK_PLACES, inDeck, upNext, widespread } from "../../src/lib/nameDeck";
import { dealing, type NameCard, type NamesView } from "../../src/lib/names";

const view = (names: NameCard[] = []): NamesView => ({ names, shortlist: [], off: [], superliked: null, together: true });

test("the deck: from several countries' registers, each name once, cased as written, its sex and figures in range", () => {
  expect(DECK_PLACES.length).toBeGreaterThanOrEqual(4);
  expect(DECK.length).toBeGreaterThan(5000);
  expect(new Set(DECK.map((d) => d.name.toLowerCase())).size).toBe(DECK.length);
  for (const d of DECK) {
    expect(d.name).toMatch(/^\p{Lu}[\p{L}'-]*\p{L}$/u);
    expect(["f", "m", "u"]).toContain(d.sex);
    expect(Number.isFinite(d.perMillion)).toBe(true);
    expect(d.top).toHaveLength(DECK_PLACES.length);
    for (const place of d.top) expect(place >= 0 && place <= 100).toBe(true);
    expect(d.common).toHaveLength(DECK_PLACES.length);
    expect(d.common.some(Boolean)).toBe(true);
    expect(d.peak % 10).toBe(0);
  }
  expect(inDeck("mckenzie")?.name).toBe("McKenzie");
  expect(inDeck("d'arcy")?.name).toBe("D'Arcy");
  // Names from every one of the countries, with their accents where they're written with them.
  expect(inDeck("aoife")?.name).toBe("Aoife");
  expect(inDeck("seán")?.name).toBe("Seán");
  expect(inDeck("Unnamed")).toBeUndefined();
});

test("each person's deck is shuffled their own way, and the same way every time", () => {
  const a = upNext(view(), "jason", "all").map((c) => c.name);
  expect(upNext(view(), "jason", "all").map((c) => c.name)).toEqual(a);
  expect(upNext(view(), "sam", "all").map((c) => c.name)).not.toEqual(a);
  expect(a).toHaveLength(DECK.filter(widespread).length);
});

test("familiar names are likelier near the front, without all coming first", () => {
  const front = upNext(view(), "jason", "all").slice(0, 100);
  const familiar = front.filter((c) => (c.deck?.perMillion ?? 0) >= 500).length;
  const share = DECK.filter((d) => d.perMillion >= 500).length / DECK.length;
  expect(familiar / 100).toBeGreaterThan(share);
  expect(familiar).toBeLessThan(90);
});

test("the standard Western names are dealt, and the regional ones kept for later, unless the other liked one", () => {
  const dealt = new Set(upNext(view(), "jason", "all").map((c) => c.name));
  expect(dealt.has("Olivia")).toBe(true);
  // Common in one place only: in the deck, with where, but not dealt.
  for (const name of ["Aroha", "Seán"]) {
    expect(inDeck(name)).toBeDefined();
    expect(inDeck(name)!.common.filter(Boolean)).toHaveLength(1);
    expect(dealt.has(name)).toBe(false);
  }
  const liked = upNext(view([{ id: "1", name: "Aroha", mine: null, deck: true }]), "jason", "all");
  expect(liked.map((c) => c.name)).toContain("Aroha");
});

test("girls' or boys' names keep the other sex out, and keep those given to either", () => {
  const girls = upNext(view(), "jason", "girls");
  expect(girls.every((c) => c.deck?.sex !== "m")).toBe(true);
  expect(girls.some((c) => c.deck?.sex === "u")).toBe(true);
  expect(upNext(view(), "jason", "boys").every((c) => c.deck?.sex !== "f")).toBe(true);
});

test("names voted on are gone; the other's added names come first; the other's liked deck names come early, not first", () => {
  const deckOrder = upNext(view(), "jason", "all").map((c) => c.name);
  const late = deckOrder.slice(-5);
  const cards = upNext(
    view([
      { id: "1", name: deckOrder[0]!, mine: false, deck: true },
      { id: "2", name: "Zephyrine", mine: null, deck: false },
      ...late.map((name, i) => ({ id: `l${i}`, name, mine: null, deck: true })),
    ]),
    "jason",
    "all"
  );
  expect(cards.map((c) => c.name)).not.toContain(deckOrder[0]);
  expect(cards[0]).toEqual({ name: "Zephyrine", id: "2", deck: null });
  const at = late.map((name) => cards.findIndex((c) => c.name === name));
  expect(Math.max(...at)).toBeLessThan(100);
  expect(cards[at[0]!]!.id).toBe("l0");
});

test("a card says where the name is in the top 10 or 100 now, or when it was most given, or how many babies get it now", () => {
  const [a, b, c] = DECK_PLACES.map((p) => p.place);
  const top = (...places: number[]) => DECK_PLACES.map((_, i) => places[i] ?? 0);
  const common = DECK_PLACES.map(() => true);
  expect(aboutName({ name: "Olivia", sex: "f", perMillion: 13_000, top: top(1, 8, 40), peak: 2010, common })).toBe(`Top 10 in ${a} and ${b}`);
  expect(aboutName({ name: "Zoe", sex: "f", perMillion: 4_800, top: top(0, 46, 37), peak: 2010, common })).toBe(`Top 100 in ${b} and ${c}`);
  expect(aboutName({ name: "Beryl", sex: "f", perMillion: 8, top: top(), peak: 1940, common })).toBe("Most given in the 1940s");
  expect(aboutName({ name: "Aaron", sex: "m", perMillion: 412, top: top(), peak: 2000, common })).toBe("About 1 in 2,400 babies now");
  expect(aboutName({ name: "Aarron", sex: "m", perMillion: 2, top: top(), peak: 2000, common })).toBe("Rare now");
  expect(aboutName(null)).toBeNull();
});

test("knowing it's a girl or a boy, the deck is that one's, with no choosing the other's", () => {
  expect(dealing("girl", "boys")).toEqual({ filter: "girls", choosable: false });
  expect(dealing("boy", undefined)).toEqual({ filter: "boys", choosable: false });
  expect(dealing("unknown", undefined)).toEqual({ filter: "all", choosable: true });
  expect(dealing("unknown", "boys")).toEqual({ filter: "boys", choosable: true });
});

test("a name on the shortlist, or taken off it, isn't dealt again, to either of you", () => {
  const deckOrder = upNext(view(), "sam", "all").map((c) => c.name);
  const [onIt, offIt] = [deckOrder[0]!, deckOrder[1]!];
  const settledView: NamesView = {
    ...view([
      { id: "1", name: onIt, mine: null, deck: true },
      { id: "2", name: "Zephyrine", mine: null, deck: false },
    ]),
    shortlist: [{ id: "1", name: onIt, star: true }],
    off: [
      { id: "3", name: offIt },
      { id: "2", name: "Zephyrine" },
    ],
  };
  const dealt = upNext(settledView, "sam", "all").map((c) => c.name);
  expect(dealt).not.toContain(onIt);
  expect(dealt).not.toContain(offIt);
  expect(dealt).not.toContain("Zephyrine");
});
