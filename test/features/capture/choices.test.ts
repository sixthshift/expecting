import { expect, test } from "vitest";
import { captureChoices } from "../../../src/features/capture/model/choices";

test("all five, in their fixed order, for a phone that's said who's holding it", () => {
  expect(captureChoices({ holding: true, quiet: false, movements: true })).toEqual(["movement", "note", "feeling", "question", "task"]);
});

test("a feeling only from a phone that's said who's holding it, and a movement only once offered", () => {
  expect(captureChoices({ holding: false, quiet: false, movements: false })).toEqual(["note", "question", "task"]);
});

test("while something has happened: never a movement, and nothing to do", () => {
  expect(captureChoices({ holding: true, quiet: true, movements: true })).toEqual(["note", "feeling", "question"]);
});
