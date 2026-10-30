import { expect, test } from "vitest";
import { captureChoices } from "../../../src/features/capture/model/choices";

test("all nine, in their fixed order, for a phone that's said who's holding it", () => {
  expect(captureChoices({ holding: true, quiet: false, movements: true })).toEqual([
    "movement",
    "sick",
    "craving",
    "note",
    "photo",
    "paper",
    "feeling",
    "question",
    "task",
  ]);
});

test("a feeling only from a phone that's said who's holding it, and a movement only once offered", () => {
  expect(captureChoices({ holding: false, quiet: false, movements: false })).toEqual(["sick", "craving", "note", "photo", "paper", "question", "task"]);
});

test("while something has happened: never a movement, sickness, a craving or a photo, and nothing to do; a paper still, as papers are admin", () => {
  expect(captureChoices({ holding: true, quiet: true, movements: true })).toEqual(["note", "paper", "feeling", "question"]);
});
