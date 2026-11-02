import { expect, test } from "vitest";
import { callsToMake, recapsSoFar } from "../../src/lib/journalNow";
import { appetite, entry } from "./storyFixtures";

// Fri 30 Oct: the fourth day of week 28.
const today = "2026-10-30";

test("a call: a movement felt as different today or yesterday, or can't keep fluids down today", () => {
  expect(callsToMake([entry("movement", "2026-10-29", { different: true, time: "09:00" })], [], today)).toEqual({ moved: true, fluids: false });
  expect(callsToMake([entry("movement", "2026-10-28", { different: true, time: "09:00" })], [], today).moved).toBe(false);
  expect(callsToMake([], [appetite("sick", today, { how: "fluids" })], today).fluids).toBe(true);
  expect(callsToMake([], [appetite("sick", "2026-10-29", { how: "fluids" })], today).fluids).toBe(false);
});

test("the recaps so far: each trimester ended, and the whole one from week 37", () => {
  expect(recapsSoFar(30).map((r) => r.key)).toEqual(["first", "second"]);
  expect(recapsSoFar(38).map((r) => r.key)).toEqual(["first", "second", "whole"]);
});
