// Pregnancy bingo (docs/plan-extras.md, part 3): a card each, 5×5 with a free
// centre, dealt from the squares below, so your two cards differ and it's a
// race. A square is marked when it happens, with its day and a few words. Five
// in a row, a column or a diagonal is bingo; play goes on to a full house.
// Both cards are seen by both of you; only your own is yours to mark.
//
// The squares are what people say and do around the two of you, and what you
// two get up to: never her body, never a symptom, and every one fits either
// of you.

import type { ISODate } from "./dates";

export type Square = { id: string; text: string };

/** The squares a card is dealt from. Ids are stored: never rename one. Short enough for a fifth of a phone's width. */
export const SQUARES: readonly Square[] = [
  // What people say.
  { id: "twins", text: "“Is it twins?”" },
  { id: "sleep-while-you-can", text: "“Sleep while you can”" },
  { id: "glowing", text: "“You're glowing!”" },
  { id: "any-day-now", text: "“Any day now?”, weeks too soon" },
  { id: "enjoy-it", text: "“Enjoy it while it lasts”" },
  { id: "was-it-planned", text: "Asked if it was planned" },
  { id: "just-wait", text: "“Just wait until…”" },
  { id: "life-will-change", text: "“Your life's about to change”" },
  { id: "best-thing", text: "“Best thing you'll ever do”" },
  { id: "knew-it", text: "“I knew before you told me”" },
  { id: "bump-size", text: "Someone remarks on the bump's size" },
  { id: "all-bump", text: "“You're all bump!”" },
  { id: "guess-from-bump", text: "The sex guessed from the bump" },
  { id: "boy-or-girl", text: "A stranger asks boy or girl" },
  { id: "finding-out", text: "Asked if you'll find out the sex" },
  { id: "birth-story", text: "A birth story you didn't ask for" },
  { id: "eat-for-two", text: "“You're eating for two now!”" },
  { id: "old-wives-tale", text: "An old wives' tale, told as fact" },
  { id: "ring-on-string", text: "The ring on a string" },
  { id: "predicts-birthday", text: "Someone predicts the birthday" },
  { id: "name-you-hate", text: "A name suggested you'd never use" },
  { id: "their-names", text: "Asked your names, told theirs" },
  { id: "nickname", text: "A relative's nickname for the baby" },
  { id: "sleep-training", text: "Unasked advice on sleep" },
  { id: "back-at-work", text: "“When are you back at work?”" },
  { id: "partner-ready", text: "The partner asked “Ready?”" },
  { id: "hows-she-going", text: "“How's she going?”, with her right there" },
  { id: "partner-congratulated", text: "The partner congratulated like they did the hard part" },
  { id: "delivery-room", text: "Someone asks to be in the room" },
  { id: "tell-me-first", text: "“Tell me the minute it happens!”" },
  { id: "when-due-three", text: "“When are you due?” three times in a day" },
  { id: "article", text: "A parenting article, sent unasked" },
  // What people do.
  { id: "bump-touch", text: "A stranger touches the bump" },
  { id: "offered-seat", text: "Offered a seat" },
  { id: "door-held", text: "A door held, with ceremony" },
  { id: "work-card", text: "A card going round at work" },
  { id: "friend-expecting", text: "A friend says they're expecting too" },
  { id: "hand-me-downs", text: "Hand-me-downs you didn't ask for" },
  { id: "noisy-gift", text: "A gift that makes a noise" },
  { id: "double-bought", text: "A grandparent buys what you already have" },
  { id: "pram-demo", text: "A full pram demonstration" },
  { id: "scan-on-fridge", text: "Your scan on someone else's fridge" },
  { id: "group-chat", text: "A group chat renamed for the baby" },
  // What the two of you get up to.
  { id: "baby-aisle", text: "“Just looking” in the baby aisle" },
  { id: "tiny-thing", text: "Bought something impossibly tiny" },
  { id: "cried-at-ad", text: "Cried at an ad" },
  { id: "name-argument", text: "The name argument, in the car" },
  { id: "car-seat-defeat", text: "Beaten by the car seat" },
  { id: "flat-pack", text: "Flat-pack, with screws left over" },
  { id: "two-am-google", text: "A 2 am search" },
  { id: "own-nickname", text: "Your own nickname for the baby" },
  { id: "names-in-bed", text: "Names read aloud in bed" },
  { id: "birth-on-tv", text: "A birth on TV, through your fingers" },
  { id: "size-of-fruit", text: "The baby's the size of something absurd" },
  { id: "class-question", text: "Someone asks your question at class" },
  { id: "playlist", text: "A playlist for the baby" },
  { id: "nursery-colour", text: "The nursery colour debate" },
  { id: "baby-cries-nearby", text: "A baby cries nearby; you look at each other" },
  { id: "pet-knows", text: "The pet won't leave you alone" },
  { id: "next-year", text: "“Next year we'll have a baby”, out loud" },
];

export function squareOf(id: string): Square | undefined {
  return SQUARES.find((s) => s.id === id);
}

/** A card's squares, row by row: 24 ids, the free centre left out. */
export const CARD_SIZE = 24;
/** The centre, by its place in the 5×5 grid (0–24). */
export const FREE = 12;

/** The card's 25 places: the free centre, and the 24 squares around it. */
export function cells(squares: readonly string[]): (string | null)[] {
  return [...squares.slice(0, FREE), null, ...squares.slice(FREE)];
}

/** The 12 lines: rows, columns and the two diagonals, as places in the grid. */
export const LINES: readonly (readonly number[])[] = [
  ...[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => r * 5 + c)),
  ...[0, 1, 2, 3, 4].map((c) => [0, 1, 2, 3, 4].map((r) => r * 5 + c)),
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

/** Deal a card: 24 different squares, shuffled. `random` is for tests. */
export function deal(random: () => number = Math.random): string[] {
  const pool = SQUARES.map((s) => s.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, CARD_SIZE);
}

/** A square marked: the day it happened, and a few words. */
export type Mark = { squareId: string; day: ISODate; note: string | null; markedAt: string };

/** One of you's card, and its marks. */
export type Card = { personId: string; squares: string[]; dealtAt: string; marks: Mark[] };

/** Where a card's up to. */
export type Standing = {
  marked: number;
  /** The lines complete, as places. */
  lines: number[][];
  /** The fewest still to mark in any line: 0 is bingo, 1 is one away. */
  closest: number;
  full: boolean;
  /** The day the first line was complete, and the full house. */
  bingoOn: ISODate | null;
  fullOn: ISODate | null;
};

/** Where a card's up to, from its marks. */
export function standing(card: Pick<Card, "squares" | "marks">): Standing {
  const placed = cells(card.squares);
  const dayOf = new Map(card.marks.map((m) => [m.squareId, m.day]));
  const done = (place: number) => place === FREE || dayOf.has(placed[place]!);
  const lines = LINES.filter((line) => line.every(done)).map((l) => [...l]);
  const closest = Math.min(...LINES.map((line) => line.filter((p) => !done(p)).length));
  // A line was complete on the day of its last square; bingo on the earliest such day.
  const lineDay = (line: readonly number[]) =>
    line
      .filter((p) => p !== FREE)
      .map((p) => dayOf.get(placed[p]!)!)
      .sort()
      .at(-1)!;
  const bingoOn = lines.length > 0 ? (lines.map(lineDay).sort()[0] as ISODate) : null;
  const marked = card.squares.filter((id) => dayOf.has(id)).length;
  const full = marked === CARD_SIZE;
  const fullOn = full ? ([...dayOf.values()].sort().at(-1) as ISODate) : null;
  return { marked, lines, closest, full, bingoOn, fullOn };
}

/** Where a card's up to, in a few words: "7 marked, one away". */
export function standingLine(s: Standing): string {
  if (s.full) return "Full house!";
  if (s.lines.length > 0) return `Bingo! ${s.marked} marked`;
  const away = s.closest === 1 ? ", one away" : s.closest === 2 && s.marked > 0 ? ", two away" : "";
  return `${s.marked} marked${away}`;
}

/** A bingo or a full house, for the Journal: whose, and the day it came. */
export type BingoMoment = { personId: string; kind: "bingo" | "full"; day: ISODate };

/** The moments on the cards: each card's first bingo and its full house. */
export function moments(cards: readonly Card[]): BingoMoment[] {
  return cards.flatMap((card) => {
    const s = standing(card);
    return [
      ...(s.bingoOn ? [{ personId: card.personId, kind: "bingo" as const, day: s.bingoOn }] : []),
      ...(s.fullOn ? [{ personId: card.personId, kind: "full" as const, day: s.fullOn }] : []),
    ];
  });
}
