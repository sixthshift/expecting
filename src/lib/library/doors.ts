// How the Library is arranged: the doors. Pure, so the order is tested apart
// from the screen. Three ways to narrow everything Expecting knows, used in turn:
//
//   door    the question you came with (Can I…?, Is this normal?, …): each
//           type of entry answers one, and is laid out for it
//   topic   a shelf within a door, or across all of them
//   week    an order within: what comes when
//
// The Library's home lists none of the entries themselves: only the doors,
// what's open right now, and the topics, each with its count. Search
// (search.ts) looks through everything, best matches first.

import { type Item, type ItemType, TOPICS, type Topic } from "../../content/schema";
import { TRIMESTERS, type Week } from "../timeline";

/** The doors, in their order on the page. All but `hard` are a type of entry; `hard` gathers the topics nobody wants to need. */
export const DOORS = ["can-i", "normal", "surprises", "glossary", "moments", "decisions", "money", "guides", "hard"] as const;

export type Door = (typeof DOORS)[number];

/** How a door's entries are laid out: rows under headings, cards, or a glossary that opens in place. */
type DoorLayout = "rows" | "cards" | "glossary";

type DoorInfo = {
  title: string;
  /** What you'd find behind it, as examples on the door. */
  examples: string;
  /** Under its title once it's open. */
  lead: string;
  /** What's behind it. */
  holds: (item: Item) => boolean;
  /** Its headings, in order, each with its entries. */
  group: (items: readonly Item[]) => Group[];
  layout: DoorLayout;
};

export type Group = { key: string; title: string; items: Item[] };

const ofType = (type: ItemType) => (item: Item) => item.type === type;

/** The topics nobody wants to need: behind a quiet door of their own, as well as on their shelves. */
export const HARD_TOPICS: readonly Topic[] = ["loss", "mental-health", "special-circumstances"];

export const DOOR_INFO: Record<Door, DoorInfo> = {
  "can-i": {
    title: "Can I…?",
    examples: "Brie, coffee, hair dye, flying",
    lead: "Food, medicines, activities and more: an answer at a glance, and why.",
    holds: ofType("can-i"),
    group: byTopic,
    layout: "rows",
  },
  normal: {
    title: "Is this normal?",
    examples: "Cramps, spotting, itchy palms",
    lead: "What's usual, and when to get help. Each page puts when to call first.",
    holds: ofType("symptom"),
    group: knowFirst,
    layout: "rows",
  },
  surprises: {
    title: "Nobody tells you",
    examples: "What people wish they'd known",
    lead: "The things people wish someone had told them.",
    holds: (item) => item.surprise,
    group: (items) => [{ key: "all", title: "Nobody tells you", items: byTitle(items) }],
    layout: "cards",
  },
  glossary: {
    title: "What does that mean?",
    examples: "CTG, GBS, effacement",
    lead: "The words you'll hear at appointments, A to Z. Tap one to read it.",
    holds: ofType("term"),
    group: byLetter,
    layout: "glossary",
  },
  moments: {
    title: "What happens at…?",
    examples: "Scans, tests, check-ups",
    lead: "The appointments, tests and milestones, in the order they come.",
    holds: ofType("moment"),
    group: (items) => byTrimester(items, (i) => i.from),
    layout: "rows",
  },
  decisions: {
    title: "What do we decide?",
    examples: "Where to give birth, screening",
    lead: "The choices to make, by when to make them.",
    holds: ofType("decision"),
    group: (items) => byTrimester(items, (i) => i.decideBy),
    layout: "rows",
  },
  money: {
    title: "What can we claim?",
    examples: "Parental leave, Medicare, payments",
    lead: "Payments, leave and paperwork, in the order they come up.",
    holds: ofType("payment"),
    group: (items) => byTrimester(items, (i) => i.from),
    layout: "rows",
  },
  guides: {
    title: "How do we…?",
    examples: "Pack the hospital bag, early labour",
    lead: "Guides to read through, by topic.",
    holds: ofType("guide"),
    group: byTopic,
    layout: "rows",
  },
  hard: {
    title: "When it's hard",
    examples: "Loss, mental health, harder pregnancies",
    lead: "For when things don't go as hoped. Read at your own pace.",
    holds: (item) => HARD_TOPICS.includes(item.topic),
    group: byTopic,
    layout: "rows",
  },
};

/** Whether a path is one of the Library's pages: its home, doors and search, or an entry's. */
export function inLibrary(pathname: string): boolean {
  return pathname === "/library" || pathname.startsWith("/library/");
}

/** What's behind `door`. */
export function behind(door: Door, items: readonly Item[]): Item[] {
  return items.filter(DOOR_INFO[door].holds);
}

/** The door each type of entry is behind: where it's found by its question. */
const TYPE_DOOR: Record<ItemType, Door> = {
  "can-i": "can-i",
  symptom: "normal",
  card: "surprises",
  term: "glossary",
  moment: "moments",
  decision: "decisions",
  payment: "money",
  guide: "guides",
};

/** The door an entry's type is behind. */
export function doorOf(item: Item): Door {
  return TYPE_DOOR[item.type];
}

/** Who a "for the partner" view keeps: what's written for the partner, and the partner's topic. */
export function forPartner(item: Item): boolean {
  return item.who === "partner" || item.topic === "partner";
}

/** The topics among `items`, in their usual order, each with how many. */
export function topicsIn(items: readonly Item[]): { topic: Topic; title: string; count: number }[] {
  return (Object.keys(TOPICS) as Topic[])
    .map((topic) => ({ topic, title: TOPICS[topic], count: items.filter((i) => i.topic === topic).length }))
    .filter((t) => t.count > 0);
}

/** A topic on its own: its entries under their type's door, in the doors' order, so each is once. */
export function topicByDoor(items: readonly Item[]): Group[] {
  const groups = DOORS.map((door) => ({
    key: door,
    title: DOOR_INFO[door].title,
    items: byTitle(items.filter((i) => doorOf(i) === door)),
  }));
  return groups.filter((g) => g.items.length > 0);
}

/** In order of title. */
export function byTitle(items: readonly Item[]): Item[] {
  return [...items].sort((a, b) => a.title.localeCompare(b.title));
}

/** A heading per topic, in their usual order. */
function byTopic(items: readonly Item[]): Group[] {
  return topicsIn(items).map(({ topic, title }) => ({ key: topic, title, items: byTitle(items.filter((i) => i.topic === topic)) }));
}

/** A symptom where a wrong answer costs most comes first, so the ones to know are seen before the rest. */
function knowFirst(items: readonly Item[]): Group[] {
  const first = items.filter((i) => i.stakes === "high");
  const rest = items.filter((i) => i.stakes !== "high");
  return [
    { key: "first", title: "Know these first", items: byTitle(first) },
    { key: "rest", title: "Everything else", items: byTitle(rest) },
  ].filter((g) => g.items.length > 0);
}

/** A heading per letter, A to Z; anything not a letter under #. */
function byLetter(items: readonly Item[]): Group[] {
  const letter = (i: Item) => {
    const first = i.title[0]?.toUpperCase() ?? "#";
    return /[A-Z]/.test(first) ? first : "#";
  };
  const letters = [...new Set(items.map(letter))].sort((a, b) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)));
  return letters.map((l) => ({ key: l, title: l, items: byTitle(items.filter((i) => letter(i) === l)) }));
}

/** In order of the week `at` gives, under its trimester; those without a week last, under Any time. */
function byTrimester(items: readonly Item[], at: (item: Item) => Week | null): Group[] {
  const sorted = [...items].sort((a, b) => (at(a) ?? 99) - (at(b) ?? 99) || (a.to ?? 99) - (b.to ?? 99) || a.title.localeCompare(b.title));
  const groups: Group[] = TRIMESTERS.map(({ key, title, from, to }) => ({
    key,
    title: `${title}, weeks ${from}–${to}`,
    items: sorted.filter((i) => {
      const w = at(i);
      return w !== null && w >= from && w <= to;
    }),
  }));
  groups.push({ key: "any", title: "Any time", items: sorted.filter((i) => at(i) === null) });
  return groups.filter((g) => g.items.length > 0);
}
