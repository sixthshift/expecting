import { expect, test } from "vitest";
import { WHOLE } from "../../src/lib/journalNow";
import { hasRecap, recapOf, recapParts } from "../../src/lib/recap";
import { appetite, DUE, entry, first, photo, story } from "./storyFixtures";

const third = { key: "third" as const, title: "Third trimester", from: 28, to: 42 };

test("a recap is built from what's there, a part only when it has something", () => {
  const empty = recapOf({ span: third, dueDate: DUE, items: [] });
  expect(hasRecap(empty)).toBe(false);

  const firsts = [first("first-kick", "2026-10-28", { words: [{ by: "sam", body: "On the couch", editedAt: "x" }] }), first("first-scan", "2026-05-01")];
  const photos = [photo("bump", "2026-10-28"), photo("bump", "2026-10-21"), photo("scan", "2026-10-29")];
  const cravings = [appetite("craving", "2026-10-28"), appetite("craving", "2026-10-29"), appetite("craving", "2026-10-29", { what: "Ice" })];
  const journal = [entry("letter", "2026-10-30", { body: "Dear you" })];
  const ticks = { t: "2026-10-28T00:00:00.000Z" };
  const items = story({ firsts, photos, appetite: cravings, journal, ticks, titles: new Map([["t", "Book classes"]]) });
  const recap = recapOf({ span: third, dueDate: DUE, items });
  expect(recap.firsts.map((f) => f.key)).toEqual(["first-kick"]);
  expect(recap.bump.map((b) => b.week)).toEqual([28]);
  expect(recap.craved).toMatchObject({ what: "Pickles", times: 2 });
  expect(recapParts(recap)).toEqual(["firsts", "bump", "scans", "craved", "voices", "letters", "done"]);

  const whole = recapOf({ span: WHOLE, dueDate: DUE, items: story({ firsts, photos, appetite: cravings.slice(2) }) });
  expect(whole.firsts.map((f) => f.key)).toEqual(["first-scan", "first-kick"]);
  expect(whole.craved).toBeNull();
  expect(recapParts(whole)).toEqual(["firsts", "bump", "scans", "voices"]);
});
