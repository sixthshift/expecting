// Small makers for the story's tests: an entry of each kind on a day.

import type { AppetiteEntry } from "../../src/lib/appetite";
import type { Feeling } from "../../src/lib/feelings";
import type { FirstKey, FirstMark } from "../../src/lib/firsts";
import type { JournalEntry } from "../../src/lib/journal";
import type { Paper } from "../../src/lib/papers";
import type { Photo } from "../../src/lib/photos";
import type { StorySources } from "../../src/lib/story";

/** Due 2027-01-19: week 28 runs Tue 27 Oct to Mon 2 Nov 2026, week 27 from 20 Oct. */
export const DUE = "2027-01-19" as const;

const at = (day: string) => `${day}T09:00:00.000Z`;

export function entry(kind: JournalEntry["kind"], day: string, over: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: `${kind}-${day}-${over.time ?? ""}-${over.body ?? ""}`,
    kind,
    day,
    time: null,
    body: kind === "movement" ? "" : "words",
    different: false,
    by: null,
    createdAt: at(day),
    editedBy: null,
    editedAt: null,
    ...over,
  };
}

export function appetite(kind: AppetiteEntry["kind"], day: string, over: Partial<AppetiteEntry> = {}): AppetiteEntry {
  return {
    id: `${kind}-${day}-${over.what ?? ""}-${over.time ?? ""}`,
    kind,
    day,
    time: null,
    how: kind === "sick" ? "queasy" : null,
    what: kind === "sick" ? null : "Pickles",
    note: null,
    by: null,
    createdAt: at(day),
    editedBy: null,
    editedAt: null,
    ...over,
  };
}

export function photo(kind: Photo["kind"], day: string, over: Partial<Photo> = {}): Photo {
  return {
    id: `${kind}-${day}`,
    fileId: `f-${kind}-${day}`,
    kind,
    day,
    time: null,
    caption: null,
    by: null,
    createdAt: at(day),
    editedBy: null,
    editedAt: null,
    ...over,
  };
}

export function paper(day: string, over: Partial<Paper> = {}): Paper {
  return {
    id: `paper-${day}`,
    kind: "result",
    title: "Blood group",
    itemId: null,
    day,
    note: null,
    handy: false,
    pages: [],
    by: null,
    createdAt: at(day),
    editedBy: null,
    editedAt: null,
    ...over,
  };
}

export function feeling(by: string, day: string, over: Partial<Feeling> = {}): Feeling {
  return { id: `feel-${by}-${day}`, by, day, time: null, step: "good", createdAt: at(day), ...over };
}

export function first(key: FirstKey, day: string | null, over: Partial<FirstMark> = {}): FirstMark {
  return { key, day, by: null, createdAt: at(day ?? "2026-01-01"), words: [], ...over };
}

export function sources(over: Partial<StorySources> = {}): StorySources {
  return { journal: [], appetite: [], photos: [], papers: [], feelings: [], firsts: [], ticks: {}, titles: new Map(), ...over };
}
