import { expect, test } from "vitest";
import { EXTRAS } from "../../src/content/extras";
import { type Choice, extrasOn, extraToOffer, inExtras } from "../../src/lib/extras";

const choice = (id: string, on: boolean): Choice => ({ id, on, changedBy: null, changedAt: "2026-10-01T00:00:00.000Z" });

test("an extra nobody has chosen is off, and so is one turned off or no longer in the file", () => {
  const on = extrasOn([choice("baby-shower", true), choice("babymoon", false), choice("pony-rides", true)]);
  expect([...on]).toEqual(["baby-shower"]);
});

test("something in no extra is always shown; in one, only while it's on", () => {
  const on = new Set(["baby-shower"]);
  expect(inExtras(null, on)).toBe(true);
  expect(inExtras("baby-shower", on)).toBe(true);
  expect(inExtras("babymoon", on)).toBe(false);
});

test("This week offers the first undecided extra whose week has come, and not before", () => {
  const first = [...EXTRAS].sort((a, b) => a.offer - b.offer)[0]!;
  expect(extraToOffer([], first.offer - 1)).toBeUndefined();
  expect(extraToOffer([], first.offer)?.id).toBe(first.id);
  // Turned on or turned down, it isn't offered again.
  expect(extraToOffer([choice(first.id, false)], first.offer)).toBeUndefined();
  expect(extraToOffer([], 42)).toBeDefined();
  expect(
    extraToOffer(
      EXTRAS.map((e) => choice(e.id, true)),
      42
    )
  ).toBeUndefined();
});
