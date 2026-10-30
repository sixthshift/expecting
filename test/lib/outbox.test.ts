import { expect, test } from "vitest";
import { sendAgain } from "../../src/lib/errors";
import { KEEPS_TIME_MS, madeAtFrom, newId } from "../../src/lib/outbox";

const now = new Date("2026-10-30T10:00:00Z");

test("a save keeps the time it was made", () => {
  expect(madeAtFrom("2026-10-30T07:30:00.000Z", now)).toEqual(new Date("2026-10-30T07:30:00Z"));
});

test("a time that's missing, nonsense, ahead of the server or too old is the time it arrived", () => {
  expect(madeAtFrom(undefined, now)).toBe(now);
  expect(madeAtFrom("yesterday", now)).toBe(now);
  expect(madeAtFrom("2026-10-30T10:05:00Z", now)).toBe(now);
  expect(madeAtFrom(new Date(now.getTime() - KEEPS_TIME_MS - 1).toISOString(), now)).toBe(now);
});

test("an id made on the phone is a v4 UUID", () => {
  expect(newId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("a save is sent again while there's no connection, never once refused, and a few times after the server's error", () => {
  expect(sendAgain(100, new TypeError("Failed to fetch"))).toBe(true);
  expect(sendAgain(0, new Response(null, { status: 401 }))).toBe(false);
  expect(sendAgain(0, new Response(null, { status: 400 }))).toBe(false);
  expect(sendAgain(0, new Error("Bad Gateway"))).toBe(true);
  expect(sendAgain(6, new Error("Bad Gateway"))).toBe(false);
});
