import { expect, test } from "vitest";
import { QuestionsRepo } from "../../src/db/models/questions/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

test("a question is asked with its answer, reopened keeping it, then deleted", () => {
  const repo = new QuestionsRepo(db());
  const q = repo.add("Is the RSV vaccine free?", new Date("2026-10-01T00:00:00Z"));
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
