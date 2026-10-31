import { expect, test } from "vitest";
import { captureChoices, journalChoices, sharedChoices } from "../../../src/features/capture/model/choices";

test("all ten, in their fixed order, for a phone that's said who's holding it", () => {
  expect(captureChoices({ holding: true, quiet: false, movements: true })).toEqual([
    "movement",
    "sick",
    "craving",
    "note",
    "photo",
    "paper",
    "feeling",
    "first",
    "question",
    "task",
  ]);
});

test("a feeling only from a phone that's said who's holding it, and a movement only once offered", () => {
  expect(captureChoices({ holding: false, quiet: false, movements: false })).toEqual([
    "sick",
    "craving",
    "note",
    "photo",
    "paper",
    "first",
    "question",
    "task",
  ]);
});

test("while something has happened: never a movement, sickness, a craving, a photo or a first, and nothing to do; a paper still, as papers are admin", () => {
  expect(captureChoices({ holding: true, quiet: true, movements: true })).toEqual(["note", "paper", "feeling", "question"]);
});

test("the Journal's Keep row is the ones it keeps", () => {
  expect(journalChoices(captureChoices({ holding: true, quiet: false, movements: true }))).toEqual([
    "movement",
    "sick",
    "craving",
    "note",
    "photo",
    "paper",
    "feeling",
    "first",
  ]);
});

test("something shared: pictures a photo or a paper, a PDF a paper, words a note, a question or a task", () => {
  const all = captureChoices({ holding: true, quiet: false, movements: true });
  expect(sharedChoices({ types: ["image/jpeg", "image/heic"], text: false }, all)).toEqual(["photo", "paper"]);
  expect(sharedChoices({ types: ["application/pdf"], text: true }, all)).toEqual(["paper"]);
  expect(sharedChoices({ types: ["image/png", "application/pdf"], text: false }, all)).toEqual(["paper"]);
  expect(sharedChoices({ types: [], text: true }, all)).toEqual(["note", "question", "task"]);
  expect(sharedChoices({ types: [], text: false }, all)).toEqual([]);
});

test("something shared while something has happened: a picture only a paper, words only a note or a question", () => {
  const quiet = captureChoices({ holding: true, quiet: true, movements: false });
  expect(sharedChoices({ types: ["image/jpeg"], text: false }, quiet)).toEqual(["paper"]);
  expect(sharedChoices({ types: [], text: true }, quiet)).toEqual(["note", "question"]);
});
