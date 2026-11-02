import { expect, test } from "vitest";
import { builtInTasks } from "../../src/content";
import { alreadyHappened, aroundNow, FIRSTS, firstsOffered } from "../../src/lib/firsts";
import { first } from "./storyFixtures";

test("the cot and the bag keep their firsts", () => {
  const keeps = (id: string) => builtInTasks.find((t) => t.id === id)?.keeps;
  expect(keeps("set-up-cot-in-your-room")).toEqual({ first: "cot-up" });
  expect(keeps("pack-hospital-bag")).toEqual({ first: "bag-packed" });
});

test("boy or girl only when you know", () => {
  expect(firstsOffered(false).some((f) => f.key === "boy-or-girl")).toBe(false);
  expect(firstsOffered(true)).toHaveLength(FIRSTS.length);
});

test("around now: the firsts whose weeks take this one in, two at most; already happened: those whose weeks are past", () => {
  const at = (now: number | null, marks = [] as ReturnType<typeof first>[]) => ({ now, marks, knowing: false, quiet: false });
  expect(aroundNow(at(4)).map((f) => f.key)).toEqual(["found-out"]);
  expect(aroundNow(at(12)).map((f) => f.key)).toEqual(["first-craving", "first-scan"]);
  expect(aroundNow(at(12, [first("first-craving", "2026-05-01"), first("first-scan", null)])).map((f) => f.key)).toEqual(["heartbeat", "told-family"]);
  expect(aroundNow({ ...at(4), quiet: true })).toEqual([]);
  expect(aroundNow(at(null))).toEqual([]);
  expect(alreadyHappened(at(4))).toEqual([]);
  expect(alreadyHappened(at(14)).map((f) => f.key)).toEqual(["found-out", "first-scan"]);
  expect(alreadyHappened(at(15, [first("found-out", "2026-04-01"), first("first-scan", null)])).map((f) => f.key)).toEqual(["first-craving", "heartbeat"]);
  expect(alreadyHappened({ ...at(30), quiet: true })).toEqual([]);
  // Boy or girl only when you know.
  expect(aroundNow(at(20)).some((f) => f.key === "boy-or-girl")).toBe(false);
  expect(aroundNow({ ...at(19), knowing: true, marks: [first("showing", "2026-01-01")] }).map((f) => f.key)).toEqual(["first-kick", "boy-or-girl"]);
});
