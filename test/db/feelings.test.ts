import { expect, test } from "vitest";
import { FeelingsRepo } from "../../src/db/models/feelings/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const ID = "11111111-1111-4111-8111-111111111111";
const NOW = new Date("2026-10-30T00:00:00Z");

function twoOfUs() {
  const people = new PeopleRepo(db());
  return { sam: people.add("Sam", "carrying").id, alex: people.add("Alex", "partner").id };
}

test("its person sees a feeling whole; the other sees only the step", () => {
  const { sam, alex } = twoOfUs();
  const repo = new FeelingsRepo(db());
  const own = repo.add({ id: ID, day: "2026-10-30", time: "21:10", step: "low", words: ["tired", "anxious"], note: "  Couldn't sleep  " }, sam, NOW);
  expect(own).toEqual({
    id: ID,
    by: sam,
    day: "2026-10-30",
    time: "21:10",
    step: "low",
    words: ["tired", "anxious"],
    note: "Couldn't sleep",
    createdAt: NOW.toISOString(),
  });

  expect(repo.list(sam)).toEqual([own]);
  expect(repo.list(alex)).toEqual([{ id: ID, by: sam, day: "2026-10-30", time: "21:10", step: "low", createdAt: NOW.toISOString() }]);
  expect(repo.list(null)[0]).not.toHaveProperty("words");
});

test("only its person can change or delete a feeling", () => {
  const { sam, alex } = twoOfUs();
  const repo = new FeelingsRepo(db());
  const own = repo.add({ id: ID, day: "2026-10-30", time: null, step: "okay", words: [], note: null }, sam, NOW);

  const change = { id: ID, day: "2026-10-30", time: null, step: "good" as const, words: ["calm" as const], note: " " };
  expect(repo.change(change, alex)).toBe(false);
  repo.delete(ID, alex);
  expect(repo.list(sam)).toEqual([own]);

  expect(repo.change(change, sam)).toBe(true);
  expect(repo.list(sam)).toEqual([{ ...own, step: "good", words: ["calm"], note: null }]);
  repo.delete(ID, sam);
  expect(repo.list(sam)).toEqual([]);
});

test("the same save sent twice adds the feeling once", () => {
  const { sam } = twoOfUs();
  const repo = new FeelingsRepo(db());
  const f = { id: ID, day: "2026-10-30", time: null, step: "great" as const, words: [], note: null };
  repo.add(f, sam, NOW);
  repo.add({ ...f, step: "rough" }, sam, NOW);
  expect(repo.list(sam)).toMatchObject([{ step: "great" }]);
});

test("a feeling goes with its person", () => {
  const { sam } = twoOfUs();
  const repo = new FeelingsRepo(db());
  repo.add({ id: ID, day: "2026-10-30", time: null, step: "okay", words: [], note: null }, sam, NOW);
  db().run("DELETE FROM person WHERE id = ?", [sam]);
  expect(repo.list(null)).toEqual([]);
});

test("the store refuses a step that isn't one", () => {
  const { sam } = twoOfUs();
  expect(() => db().run("INSERT INTO feeling (id, by, day, step, created_at) VALUES (?, ?, '2026-10-30', 'meh', '2026-10-30T00:00:00Z')", [ID, sam])).toThrow();
});
