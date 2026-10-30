// How the Library is arranged. Pure, so the order is tested apart from the
// screen. Three ways to narrow everything Expecting knows, used in turn:
//
//   door    the question you came with (Can I…?, Is this normal?, …): each
//           type of entry answers one, and is laid out for it
//   topic   a shelf within a door, or across all of them
//   week    an order within: what comes when
//
// The Library's home lists none of the entries themselves: only the doors,
// what's open right now, and the topics, each with its count. Search, on the
// page, looks through everything, best matches first.
//
// Right now: the items that ask something of you open this week,
// soonest-closing first, each with where its window stands.
//
// On This week, two more: what's worth knowing as a week starts (what asks
// something of you, and what's short enough to belong to that week), and the
// week's heads-up, one card nobody tells you about.

import { asks, type DatedItem, type Item, type ItemType, isDated, TOPICS, type Topic } from "../content/schema";
import { allWeeks, type Week } from "./timeline";

/** The doors, in their order on the page. All but `hard` are a type of entry; `hard` gathers the topics nobody wants to need. */
export const DOORS = ["can-i", "normal", "surprises", "glossary", "moments", "decisions", "money", "guides", "hard"] as const;

export type Door = (typeof DOORS)[number];

/** How a door's entries are laid out: rows under headings, cards, or a glossary that opens in place. */
export type DoorLayout = "rows" | "cards" | "glossary";

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

/** Whether `door` is one of the doors: for a search param. */
export function isDoor(door: string): door is Door {
  return (DOORS as readonly string[]).includes(door);
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

function byTitle(items: readonly Item[]): Item[] {
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

/** The three trimesters, as weeks: 1–13, 14–27, 28–42. */
export const TRIMESTERS = [
  { key: "first", title: "First trimester, weeks 1–13", to: 13 },
  { key: "second", title: "Second trimester, weeks 14–27", to: 27 },
  { key: "third", title: "Third trimester, weeks 28–42", to: 42 },
] as const;

/** In order of the week `at` gives, under its trimester; those without a week last, under Any time. */
function byTrimester(items: readonly Item[], at: (item: Item) => Week | null): Group[] {
  const sorted = [...items].sort((a, b) => (at(a) ?? 99) - (at(b) ?? 99) || (a.to ?? 99) - (b.to ?? 99) || a.title.localeCompare(b.title));
  let from = 0;
  const groups: Group[] = TRIMESTERS.map(({ key, title, to }) => {
    const group = {
      key,
      title,
      items: sorted.filter((i) => {
        const w = at(i);
        return w !== null && w > from && w <= to;
      }),
    };
    from = to;
    return group;
  });
  groups.push({ key: "any", title: "Any time", items: sorted.filter((i) => at(i) === null) });
  return groups.filter((g) => g.items.length > 0);
}

/**
 * What was typed, through everything: every word must be in an entry's title, the question it answers, its other
 * names or its summary. Those matching on their title, question or other names come first, then by title.
 */
export function search(items: readonly Item[], query: string): Item[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const named = (i: Item) => `${i.title} ${i.ask ?? ""} ${i.aliases.join(" ")}`.toLowerCase();
  const all = (text: string) => words.every((w) => text.includes(w));
  const strong = items.filter((i) => all(named(i)));
  const weak = items.filter((i) => !strong.includes(i) && all(`${named(i)} ${i.summary ?? ""}`.toLowerCase()));
  return [...byTitle(strong), ...byTitle(weak)];
}

/** Where an item's window stands this week. */
export type Standing =
  /** Its last week is this one. */
  | { kind: "closing" }
  /** It closes within a month: worth counting down. */
  | { kind: "left"; weeks: number }
  /** It has a while yet: say how long it has been open instead. */
  | { kind: "open"; since: Week };

export type RightNow = { item: DatedItem; standing: Standing };

/** A window closing within this many weeks counts down; a longer one says when it opened. */
export const COUNTDOWN_WEEKS = 4;

/**
 * Right now, at week `now`: the items that ask something of you whose weeks cover it, soonest-closing
 * first (then the one open longest, then by title), each with where its window
 * stands.
 */
export function rightNow(items: readonly Item[], now: Week): RightNow[] {
  return items
    .filter(asks)
    .filter((i) => i.from <= now && now <= i.to)
    .sort((a, b) => a.to - b.to || a.from - b.from || a.title.localeCompare(b.title))
    .map((item) => ({ item, standing: standingAt(item, now) }));
}

function standingAt(item: DatedItem, now: Week): Standing {
  const left = item.to - now;
  if (left === 0) return { kind: "closing" };
  if (left <= COUNTDOWN_WEEKS) return { kind: "left", weeks: left };
  return { kind: "open", since: item.from };
}

/** "Closes this week", "3 weeks left", "Open since week 24", "Opened this week". */
export function standingLabel(standing: Standing, now: Week): string {
  switch (standing.kind) {
    case "closing":
      return "Closes this week";
    case "left":
      return standing.weeks === 1 ? "1 week left" : `${standing.weeks} weeks left`;
    case "open":
      return standing.since === now ? "Opened this week" : `Open since week ${standing.since}`;
  }
}

/** A window longer than this many weeks is any time: it's in the Library, not on a week. */
export const ON_A_WEEK = 12;

const STAKES_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

/** Whether `item` may come to you unasked: the hard topics and private entries wait to be looked for. */
function unasked(item: Item): boolean {
  return !item.private && !HARD_TOPICS.includes(item.topic);
}

/**
 * Worth knowing in `week`: what starts that week, either asking something of you or
 * with a window short enough to belong to it (ON_A_WEEK). Never a card (one is the
 * week's heads-up) and never what waits to be looked for. Highest stakes first, then
 * what asks something of you, then by title.
 */
export function worthKnowing(items: readonly Item[], week: Week): DatedItem[] {
  return items
    .filter((i): i is DatedItem => i.from === week)
    .filter((i) => i.tasks.length > 0 || (i.type !== "card" && unasked(i) && i.to - i.from <= ON_A_WEEK))
    .sort(
      (a, b) => (STAKES_ORDER[a.stakes ?? ""] ?? 3) - (STAKES_ORDER[b.stakes ?? ""] ?? 3) || Number(asks(b)) - Number(asks(a)) || a.title.localeCompare(b.title)
    );
}

/**
 * One of the things nobody tells you for each week, the same on both phones: walking
 * the weeks in order, each takes, of the cards covering it not yet taken, the one that
 * started nearest (then higher stakes, then by id). So none repeats, and a card tends
 * to come up in the week it starts. A week with none left has none.
 */
export function headsUps(items: readonly Item[]): Map<Week, DatedItem> {
  const cards = items.filter((i): i is DatedItem => i.type === "card" && isDated(i) && unasked(i));
  const taken = new Set<string>();
  const byWeek = new Map<Week, DatedItem>();
  for (const week of allWeeks()) {
    const card = cards
      .filter((c) => !taken.has(c.id) && c.from <= week && week <= c.to)
      .sort((a, b) => b.from - a.from || (STAKES_ORDER[a.stakes ?? ""] ?? 3) - (STAKES_ORDER[b.stakes ?? ""] ?? 3) || a.id.localeCompare(b.id))[0];
    if (!card) continue;
    taken.add(card.id);
    byWeek.set(week, card);
  }
  return byWeek;
}

/** Text as `namesPrivate` compares it: lower case, its spaces single, trimmed. */
function plain(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Whether `text`, saved to the space both phones share, would name a private
 * entry: its id anywhere in it, or its title, its question, or the question a
 * page would add for it ("About …") as the whole of it. What someone types in
 * their own words is theirs to save; what the app would write for them from a
 * private entry, it never does.
 */
export function namesPrivate(text: string, items: readonly Item[]): boolean {
  const said = plain(text);
  if (said === "") return false;
  return items.some(
    (item) => item.private && (said.includes(item.id) || [item.title, item.ask, `About ${item.title}`].some((name) => name !== null && plain(name) === said))
  );
}
