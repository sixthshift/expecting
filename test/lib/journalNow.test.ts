import { describe, expect, test } from "vitest";
import { callsToMake, nowCards, recapDue, recapsSoFar } from "../../src/lib/journalNow";
import { storyItems } from "../../src/lib/story";
import { positionOn } from "../../src/lib/timeline";
import { appetite, DUE, entry, photo, sources } from "./storyFixtures";

const sam = { id: "sam", name: "Sam", role: "carrying" as const };
const alex = { id: "alex", name: "Alex", role: "partner" as const };
// Fri 30 Oct: the fourth day of week 28.
const today = "2026-10-30";
const base = {
  items: [],
  kept: null,
  seen: null,
  me: sam,
  people: [sam, alex],
  suggestions: [],
  today,
  position: positionOn(today, DUE),
  dueDate: DUE,
  quiet: false,
  // Week 28 is the week after the second trimester: its recap, opened already.
  recapsOpened: ["second"],
} as const;

test("a call: a movement felt as different today or yesterday, or can't keep fluids down today", () => {
  expect(callsToMake([entry("movement", "2026-10-29", { different: true, time: "09:00" })], [], today)).toEqual({ moved: true, fluids: false });
  expect(callsToMake([entry("movement", "2026-10-28", { different: true, time: "09:00" })], [], today).moved).toBe(false);
  expect(callsToMake([], [appetite("sick", today, { how: "fluids" })], today).fluids).toBe(true);
  expect(callsToMake([], [appetite("sick", "2026-10-29", { how: "fluids" })], today).fluids).toBe(false);
});

describe("the cards", () => {
  test("since you looked: what the other kept after, never a feeling or what was done", () => {
    const items = storyItems(
      sources({
        journal: [
          entry("note", "2026-10-30", { by: "alex", createdAt: "2026-10-30T10:00:00.000Z" }),
          entry("note", "2026-10-29", { by: "alex", createdAt: "2026-10-29T10:00:00.000Z" }),
          entry("note", "2026-10-30", { by: "sam", body: "mine", createdAt: "2026-10-30T11:00:00.000Z" }),
        ],
      })
    );
    const [card] = nowCards({ ...base, items, seen: "2026-10-30T00:00:00.000Z" });
    expect(card?.kind === "since" && card.items.length).toBe(1);
    expect(card?.kind === "since" && card.people).toEqual([alex]);
    expect(nowCards({ ...base, items, seen: null })).toEqual([]);
    expect(nowCards({ ...base, items, seen: "2026-10-30T00:00:00.000Z", people: [sam] })).toEqual([]);
  });

  test("this day, weeks ago: two weeks back or more, the nearest, a photo before a note", () => {
    const items = storyItems(sources({ journal: [entry("note", "2026-10-16"), entry("note", "2026-10-23")], photos: [photo("scan", "2026-10-16")] }));
    const [card] = nowCards({ ...base, items });
    expect(card).toMatchObject({ kind: "weeksAgo", weeks: 2, item: { kind: "photo" } });
  });

  test("last week, kept, in the first two days of a week", () => {
    const items = storyItems(sources({ journal: [entry("note", "2026-10-22")] }));
    expect(nowCards({ ...base, items, today: "2026-10-27", position: positionOn("2026-10-27", DUE) })[0]).toMatchObject({ kind: "lastWeek", week: 27 });
    expect(nowCards({ ...base, items }).some((c) => c.kind === "lastWeek")).toBe(false);
  });

  test("at most two, in order; just kept first; nothing while something has happened", () => {
    const kept = storyItems(sources({ journal: [entry("note", today)] }))[0]!;
    const suggestions = [{ key: "first-kick" as const, day: "2026-07-14" as const, why: "x" }];
    const cards = nowCards({ ...base, kept, suggestions, position: positionOn("2027-01-05", DUE) });
    expect(cards.map((c) => c.kind)).toEqual(["kept", "first"]);
    expect(nowCards({ ...base, kept, suggestions, quiet: true })).toEqual([]);
  });

  test("a recap the week after a trimester ends, the whole one from week 37, not once opened", () => {
    expect(recapDue(14)?.key).toBe("first");
    expect(recapDue(15)).toBeNull();
    expect(recapDue(28)?.key).toBe("second");
    expect(recapDue(37)?.key).toBe("whole");
    expect(recapsSoFar(30).map((r) => r.key)).toEqual(["first", "second"]);
    expect(recapsSoFar(38).map((r) => r.key)).toEqual(["first", "second", "whole"]);
    const position = { week: 14, gestationDays: 101 };
    expect(nowCards({ ...base, position })[0]).toMatchObject({ kind: "recap", span: { key: "first" } });
    expect(nowCards({ ...base, position, recapsOpened: ["first"] })).toEqual([]);
    // Nothing kept or done in those weeks: no recap to offer.
    expect(nowCards({ ...base, position, recapsOpened: [], recapHas: () => false })).toEqual([]);
  });
});
