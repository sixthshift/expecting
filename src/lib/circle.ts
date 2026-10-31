// Your people (docs/plan-extras.md, part 2): the people you know, each with
// something about them, kept by either of you. One list, and a view of it
// for each extra turned on: who visits, who hears first, who helps (and the
// meal train), and who gave what. Expecting keeps it and sends nothing: the
// announcement goes out through the share sheet, the roster is copied.

import { type ISODate, isISODate } from "./dates";

/** When someone is welcome: in hospital, the first weeks home, or not yet. */
export const VISITS = { hospital: "In hospital", "first-weeks": "The first weeks", "not-yet": "Not yet" } as const;
export type Visit = keyof typeof VISITS;

/** When someone hears of the birth: first, next, or with everyone. */
export const HEARS = { first: "Hears first", next: "Next", everyone: "With everyone" } as const;
export type Hears = keyof typeof HEARS;

/** A person, as kept: a name, a few words, and what each view sets. */
export type CirclePerson = {
  id: string;
  name: string;
  /** A few words: "Sam's sister", a number. */
  note: string | null;
  visit: Visit | null;
  hears: Hears | null;
  /** What they'll help with. */
  help: string | null;
  /** Their day on the meal train. */
  mealDay: ISODate | null;
  by: string | null;
  createdAt: string;
};

/** Something someone gave, and whether they've been thanked. */
export type Gift = { id: string; personId: string; what: string; thankedAt: string | null; by: string | null; createdAt: string };

/** The words for the birth, written ahead; null until someone writes them. */
export type Announcement = { body: string; by: string | null; updatedAt: string } | null;

export type Circle = { people: CirclePerson[]; gifts: Gift[]; announcement: Announcement };

/** What a view sets on a person, by field. */
export type PersonPatch = { visit?: Visit | null; hears?: Hears | null; help?: string | null; mealDay?: ISODate | null };

/** The views, in order, each with the extra that brings it (extras.data.ts). */
export const VIEWS = {
  visitors: { title: "Visitors", extra: "visitors" },
  hearing: { title: "Hearing first", extra: "birth-announcement" },
  help: { title: "Help", extra: "help-network" },
  gifts: { title: "Gifts", extra: "thank-you-notes" },
} as const;
export type View = keyof typeof VIEWS;
export const VIEW_KEYS = Object.keys(VIEWS) as View[];

/** The extras that bring Your people: with none on, it isn't there. */
export const CIRCLE_EXTRAS: readonly string[] = VIEW_KEYS.map((v) => VIEWS[v].extra);

/** The views whose extra is on, in order. */
export function viewsOn(on: ReadonlySet<string>): View[] {
  return VIEW_KEYS.filter((v) => on.has(VIEWS[v].extra));
}

/** People by name, ignoring case. */
export function byName(people: readonly CirclePerson[]): CirclePerson[] {
  return [...people].sort((a, b) => a.name.localeCompare(b.name, "en-AU", { sensitivity: "base" }));
}

/** A view's groups: each value's people, then those not yet decided (`undecided`, its title), leaving out empty groups. */
export function groupsOf<K extends string>(
  people: readonly CirclePerson[],
  labels: Record<K, string>,
  value: (p: CirclePerson) => K | null,
  undecided = "Not decided"
): { key: K | "undecided"; title: string; people: CirclePerson[] }[] {
  const sorted = byName(people);
  const keys = Object.keys(labels) as K[];
  return [
    ...keys.map((key) => ({ key, title: labels[key], people: sorted.filter((p) => value(p) === key) })),
    { key: "undecided" as const, title: undecided, people: sorted.filter((p) => value(p) === null) },
  ].filter((g) => g.people.length > 0);
}

/** The meal train: those with a day, by day, then name. */
export function mealTrain(people: readonly CirclePerson[]): (CirclePerson & { mealDay: ISODate })[] {
  return byName(people)
    .filter((p): p is CirclePerson & { mealDay: ISODate } => p.mealDay !== null)
    .sort((a, b) => a.mealDay.localeCompare(b.mealDay));
}

/** The meal train as text, for whoever is organising it: a line a day. */
export function rosterText(people: readonly CirclePerson[], day: (d: ISODate) => string): string {
  return mealTrain(people)
    .map((p) => `${day(p.mealDay)}: ${p.name}${p.help ? ` (${p.help})` : ""}`)
    .join("\n");
}

/** The gifts still to thank for. */
export function toThank(gifts: readonly Gift[]): Gift[] {
  return gifts.filter((g) => g.thankedAt === null);
}

/** Who hears in a round, by name. */
export function round(people: readonly CirclePerson[], hears: Hears): CirclePerson[] {
  return byName(people).filter((p) => p.hears === hears);
}

/** A person with a view's change made: words trimmed, empty is none; a day that isn't one is none. */
export function patched(person: CirclePerson, patch: PersonPatch): CirclePerson {
  const next = { ...person };
  if (patch.visit !== undefined) next.visit = patch.visit;
  if (patch.hears !== undefined) next.hears = patch.hears;
  if (patch.help !== undefined) next.help = patch.help?.trim() || null;
  if (patch.mealDay !== undefined) next.mealDay = patch.mealDay && isISODate(patch.mealDay) ? patch.mealDay : null;
  return next;
}
