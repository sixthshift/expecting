import { expect, test } from "vitest";
import { builtInTasks } from "../../src/content";
import { aroundNow, FIRST_TICKS, FIRSTS, firstsOffered, stillToCome, suggestFirsts } from "../../src/lib/firsts";
import { appetite, entry, first, photo } from "./storyFixtures";

const people = [
  { id: "sam", name: "Sam", role: "carrying" as const },
  { id: "alex", name: "Alex", role: "partner" as const },
];
const none = { marks: [], journal: [], photos: [], appetite: [], ticks: {}, people, quiet: false };

test("every first's tick is a built-in task", () => {
  for (const task of Object.values(FIRST_TICKS)) expect(builtInTasks.some((t) => t.id === task)).toBe(true);
});

test("boy or girl only when you know", () => {
  expect(firstsOffered(false).some((f) => f.key === "boy-or-girl")).toBe(false);
  expect(firstsOffered(true)).toHaveLength(FIRSTS.length);
});

test("suggested from the earliest of what's kept and done, in order", () => {
  const suggestions = suggestFirsts({
    ...none,
    journal: [entry("movement", "2026-07-20", { by: "alex", time: "08:00" }), entry("movement", "2026-07-14", { by: "sam", time: "21:00" })],
    photos: [photo("scan", "2026-05-01"), photo("scan", "2026-04-02"), photo("bump", "2026-06-01")],
    appetite: [appetite("craving", "2026-05-10"), appetite("sick", "2026-04-01")],
    ticks: { "pack-hospital-bag": "2026-12-01T22:00:00.000Z" },
  });
  expect(suggestions.map((s) => [s.key, s.day])).toEqual([
    ["first-craving", "2026-05-10"],
    ["first-scan", "2026-04-02"],
    ["showing", "2026-06-01"],
    ["first-kick", "2026-07-14"],
    ["felt-outside", "2026-07-20"],
    ["bag-packed", expect.stringMatching(/^2026-12-0[12]$/)],
  ]);
});

test("never one marked or put aside, and none while something has happened", () => {
  const photos = [photo("scan", "2026-04-02")];
  expect(suggestFirsts({ ...none, photos, marks: [first("first-scan", null)] })).toEqual([]);
  expect(suggestFirsts({ ...none, photos, marks: [first("first-scan", "2026-04-01")] })).toEqual([]);
  expect(suggestFirsts({ ...none, photos, quiet: true })).toEqual([]);
});

test("around now: the firsts whose weeks take this one in, two at most; still to come: the next three", () => {
  const at = (now: number | null, marks = [] as ReturnType<typeof first>[]) => ({ now, marks, knowing: false, quiet: false });
  expect(aroundNow(at(4)).map((f) => f.key)).toEqual(["found-out"]);
  expect(aroundNow(at(12)).map((f) => f.key)).toEqual(["first-craving", "first-scan"]);
  expect(aroundNow(at(12, [first("first-craving", "2026-05-01"), first("first-scan", null)])).map((f) => f.key)).toEqual(["heartbeat", "told-family"]);
  expect(aroundNow({ ...at(4), quiet: true })).toEqual([]);
  expect(aroundNow(at(null))).toEqual([]);
  expect(stillToCome(at(4)).map((f) => [f.key, f.weeks[0]])).toEqual([
    ["first-craving", 5],
    ["first-scan", 7],
    ["heartbeat", 8],
  ]);
  expect(stillToCome(at(37))).toEqual([]);
  // Boy or girl only when you know.
  expect(aroundNow(at(20)).some((f) => f.key === "boy-or-girl")).toBe(false);
  expect(aroundNow({ ...at(19), knowing: true, marks: [first("showing", "2026-01-01")] }).map((f) => f.key)).toEqual(["first-kick", "boy-or-girl"]);
});
