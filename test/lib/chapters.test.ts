import { expect, test } from "vitest";
import { builtInItems } from "../../src/content";
import { CHAPTERS, chapterOf, contents, young } from "../../src/lib/chapters";
import { FIRSTS } from "../../src/lib/firsts";
import { PLACES, placesReady } from "../../src/lib/places";
import { storyItems } from "../../src/lib/story/items";
import { DUE, entry, first, paper, photo, sources } from "./storyFixtures";

test("the chapters run through the weeks without a gap, and every first is in one", () => {
  const weeks = CHAPTERS.flatMap((c) => (c.weeks ? [c.weeks] : []));
  expect(weeks[0]![0]).toBe(1);
  expect(weeks.at(-1)![1]).toBe(42);
  for (const [i, w] of weeks.entries()) if (i > 0) expect(w[0]).toBe(weeks[i - 1]![1] + 1);
  expect(CHAPTERS.flatMap((c) => c.firsts).sort()).toEqual(FIRSTS.map((f) => f.key).sort());
  expect(chapterOf(28).title).toBe("Getting ready");
  expect(chapterOf(13).title).toBe("The first scan");
});

test("the contents: begun, now, still to come, or passed; the birth always still to come", () => {
  // At week 28 (DUE): a note in week 27, the first kick marked in week 23, nothing in the first chapters.
  const firsts = [first("first-kick", "2026-09-22")];
  const items = storyItems(sources({ journal: [entry("note", "2026-10-20")], firsts }));
  const lines = contents({ items, dueDate: DUE, now: 28 });
  expect(lines.map((l) => [l.chapter.key, l.state, l.kept])).toEqual([
    ["finding-out", "passed", 0],
    ["first-scan", "passed", 0],
    ["telling", "passed", 0],
    ["halfway", "passed", 0],
    ["moving", "begun", 2],
    ["ready", "now", 0],
    ["last-weeks", "to-come", 0],
    ["birth", "to-come", 0],
  ]);
  expect(young(items)).toBe(true);
});

test("each place is for a Library entry, inside its weeks", () => {
  for (const place of PLACES) {
    if (!place.itemId) continue;
    const item = builtInItems.find((i) => i.id === place.itemId);
    expect(item, place.itemId).toBeTruthy();
    // The place's weeks are its entry's.
    expect(item && [item.from, item.to]).toEqual(place.weeks);
  }
});

test("a place is ready in its weeks until it's used, and never while something has happened", () => {
  const base = { photos: [], papers: [], dueDate: DUE, quiet: false } as const;
  expect(placesReady({ ...base, now: 10 }).map((p) => p.key)).toEqual(["dating-scan"]);
  // A scan kept in its weeks uses it (28 Jun is week 10 with this due date).
  expect(placesReady({ ...base, now: 10, photos: [photo("scan", "2026-06-28")] }).map((p) => p.key)).toEqual([]);
  expect(placesReady({ ...base, now: 25 }).map((p) => p.key)).toEqual(["glucose-tolerance-test", "bump"]);
  expect(placesReady({ ...base, now: 25, papers: [paper("2026-10-01", { itemId: "glucose-tolerance-test" })], photos: [photo("bump", "2026-10-01")] })).toEqual(
    []
  );
  expect(placesReady({ ...base, now: 10, quiet: true })).toEqual([]);
  expect(placesReady({ ...base, now: null })).toEqual([]);
});
