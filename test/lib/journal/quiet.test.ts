import { expect, test } from "vitest";
import { handyByDefault, topicsFor } from "../../../src/lib/journal/papers";
import { FOLDED_WHILE_QUIET, foldedWhileQuiet, kindsOffered, QUIET_PAPERS, QUIET_SUPPORT } from "../../../src/lib/journal/quiet";
import { collectionOf } from "../../../src/lib/journal/story/collections";
import { appetite, entry, feeling, first, paper, photo, story } from "./storyFixtures";

test("what's about the baby folds away; the notes, letters, feelings and papers stay", () => {
  const items = story({
    journal: [entry("note", "2026-10-27"), entry("letter", "2026-10-26"), entry("movement", "2026-10-25", { time: "09:00" })],
    appetite: [appetite("craving", "2026-10-24")],
    photos: [photo("scan", "2026-10-23")],
    papers: [paper("2026-10-22")],
    feelings: [feeling("sam", "2026-10-21")],
    firsts: [first("first-kick", "2026-07-14")],
  });
  expect(items.filter(foldedWhileQuiet).map((i) => i.kind)).toEqual(["movements", "appetite", "photo", "first"]);
  expect(items.filter((i) => !foldedWhileQuiet(i)).map((i) => i.kind)).toEqual(["note", "letter", "paper", "feeling"]);
  // The folded collections are the folded lines'.
  expect(new Set(items.filter(foldedWhileQuiet).map(collectionOf))).toEqual(new Set(FOLDED_WHILE_QUIET));
});

test("never a bump after a loss; with hard news, anything", () => {
  expect(kindsOffered("loss")).toEqual(["scan", "other"]);
  expect(kindsOffered("news")).toEqual(["bump", "scan", "other"]);
  expect(kindsOffered(null)).toEqual(["bump", "scan", "other"]);
});

test("someone to talk to while something has happened: the loss services", () => {
  expect(QUIET_SUPPORT).toBe("loss-support-services");
});

test("after a loss the papers suggest nothing pregnancy-forward; with hard news, as ever", () => {
  const span = () => null;
  expect(QUIET_PAPERS.loss.lead).toMatch(/the papers from the hospital/);
  expect(QUIET_PAPERS.news.lead).toBeNull();
  expect(topicsFor("plan", { week: null, quiet: "loss", span })).toEqual([]);
  expect(topicsFor("plan", { week: null, quiet: "news", span })).toEqual(topicsFor("plan", { week: null, quiet: null, span }));
  expect(handyByDefault("plan", null, "loss")).toBe(false);
  expect(handyByDefault("plan", null, "news")).toBe(true);
});
