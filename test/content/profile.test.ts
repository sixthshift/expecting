import { describe, expect, test } from "vitest";
import { applies, cleanProfile, isAnswer, PROFILE, parseProfile } from "../../src/content/profile";

describe("content/profile.yaml", () => {
  test("loads, every question with answers", () => {
    expect(PROFILE.length).toBeGreaterThan(0);
    expect(isAnswer("cover", "yes")).toBe(true);
    expect(isAnswer("cover", "maybe")).toBe(false);
  });

  test.each([
    ["a repeated id", "- { id: a, ask: A, answers: { x: X, y: Y } }\n- { id: a, ask: B, answers: { x: X, y: Y } }", /appears twice/],
    ["one answer", "- { id: a, ask: A, answers: { x: X } }", /at least two answers/],
    ["an id content can't name", "- { id: first-baby, ask: A, answers: { x: X, y: Y } }", /camelCase/],
  ])("rejects %s", (_name, text, message) => {
    expect(() => parseProfile(text)).toThrow(message);
  });
});

describe("applies", () => {
  const when = { cover: ["no", "unsure"] };

  test("an item with no conditions is for everyone", () => {
    expect(applies({}, { cover: "yes" })).toBe(true);
  });

  test("an unanswered question hides nothing", () => {
    expect(applies(when, {})).toBe(true);
  });

  test("a definite answer decides", () => {
    expect(applies(when, { cover: "no" })).toBe(true);
    expect(applies(when, { cover: "yes" })).toBe(false);
  });

  test("every condition must hold", () => {
    expect(applies({ ...when, state: ["vic"] }, { cover: "no", state: "nsw" })).toBe(false);
  });
});

test("answers whose question or answer has gone are dropped", () => {
  expect(cleanProfile({ cover: "yes", mood: "happy", state: "atlantis" })).toEqual({ cover: "yes" });
});
