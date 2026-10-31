import { expect, test } from "vitest";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { QuestionsRepo } from "../../src/db/models/questions/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

test("a question is asked with its answer, reopened keeping it, then deleted", () => {
  const repo = new QuestionsRepo(db());
  const q = repo.add("Is the RSV vaccine free?", {}, new Date("2026-10-01T00:00:00Z"));
  repo.markAsked(q.id, "  Yes, under the NIP.  ", new Date("2026-10-05T00:00:00Z"));
  expect(repo.list()).toEqual([{ ...q, answer: "Yes, under the NIP.", askedAt: "2026-10-05T00:00:00.000Z" }]);
  repo.reopen(q.id);
  expect(repo.list()[0]).toMatchObject({ askedAt: null, answer: "Yes, under the NIP." });
  repo.delete(q.id);
  expect(repo.list()).toEqual([]);
});

test("an empty answer is no answer", () => {
  const repo = new QuestionsRepo(db());
  const q = repo.add("Anything?");
  repo.markAsked(q.id, "   ");
  expect(repo.list()[0]!.answer).toBeNull();
});

test("a question keeps the id its phone gave it, and the same save sent twice adds it once", () => {
  const repo = new QuestionsRepo(db());
  const id = "11111111-1111-4111-8111-111111111111";
  repo.add("Is the RSV vaccine free?", {}, new Date("2026-10-01T00:00:00Z"), id);
  repo.add("Is the RSV vaccine free?", {}, new Date("2026-10-02T00:00:00Z"), id);
  expect(repo.list()).toEqual([
    { id, text: "Is the RSV vaccine free?", answer: null, askedAt: null, itemId: null, by: null, createdAt: "2026-10-01T00:00:00.000Z" },
  ]);
});

test("a question remembers the entry it was asked from and who added it", () => {
  const sam = new PeopleRepo(db()).add("Sam", "carrying");
  const repo = new QuestionsRepo(db());
  const q = repo.add("Can you check my iron?", { itemId: "anaemia", by: sam.id });
  expect(repo.list()[0]).toMatchObject({ id: q.id, itemId: "anaemia", by: sam.id });
});
