import { expect, test } from "vitest";
import { canBecome, QUIET_KINDS, type Quiet } from "../../src/lib/quiet";

const quiet = (kind: Quiet["kind"]): Quiet => ({ kind, setBy: null, setAt: "2026-10-30T09:00:00.000Z" });

test("anything can happen first; hard news can become a loss, never the other way", () => {
  for (const kind of QUIET_KINDS) expect(canBecome(null, kind)).toBe(true);
  expect(canBecome(quiet("news"), "loss")).toBe(true);
  expect(canBecome(quiet("loss"), "news")).toBe(false);
  expect(canBecome(quiet("loss"), "loss")).toBe(false);
});
