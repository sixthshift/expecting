import { expect, test } from "vitest";
import { notesSummary } from "../../../../src/lib/journal/summaries/notes";
import { DUE, entry } from "../storyFixtures";
import { on, today } from "./days";

test("notes and letters: how many of each, the last, and since when; none, no record", () => {
  expect(notesSummary([entry("note", on(4, 2)), entry("letter", on(20, 1)), entry("note", on(30, 2)), entry("movement", on(30, 2))], today, DUE)).toEqual({
    headline: "2 notes · 1 letter",
    lines: ["Last kept yesterday.", "The first in week 4."],
    lately: true,
  });
  expect(notesSummary([], today, DUE)).toBeNull();
});
