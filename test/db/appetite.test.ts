import { expect, test } from "vitest";
import { AppetiteRepo } from "../../src/db/models/appetite/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const ID = "11111111-1111-4111-8111-111111111111";
const NOW = new Date("2026-10-30T00:00:00Z");
const LATER = new Date("2026-10-30T08:00:00Z");

test("sickness keeps how bad, a craving keeps what, both shared and changed by either of you", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying").id;
  const alex = people.add("Alex", "partner").id;
  const repo = new AppetiteRepo(db());

  const sick = repo.add({ id: ID, kind: "sick", day: "2026-10-30", time: "03:10", how: "vomited", what: " stray ", note: "  " }, alex, NOW);
  expect(sick).toEqual({
    id: ID,
    kind: "sick",
    day: "2026-10-30",
    time: "03:10",
    how: "vomited",
    what: null,
    note: null,
    by: alex,
    createdAt: NOW.toISOString(),
    editedBy: null,
    editedAt: null,
  });
  expect(repo.list()).toEqual([sick]);

  // The same save sent twice is kept once.
  repo.add({ id: ID, kind: "sick", day: "2026-10-30", time: "03:10", how: "queasy", what: null, note: null }, alex, NOW);
  expect(repo.list()).toEqual([sick]);

  repo.edit({ id: ID, kind: "sick", day: "2026-10-30", time: "03:00", how: "fluids", what: null, note: " Even water " }, sam, LATER);
  expect(repo.list()).toEqual([{ ...sick, time: "03:00", how: "fluids", note: "Even water", editedBy: sam, editedAt: LATER.toISOString() }]);

  const pickles = repo.add(
    { id: "22222222-2222-4222-8222-222222222222", kind: "craving", day: "2026-10-29", time: null, how: "queasy", what: " Pickles ", note: null },
    sam,
    NOW
  );
  expect(pickles).toMatchObject({ kind: "craving", how: null, what: "Pickles" });
  expect(repo.list()).toHaveLength(2);
});

test("a deleted entry comes back as it was, and the store refuses one that doesn't make sense", () => {
  const repo = new AppetiteRepo(db());
  const off = repo.add({ id: ID, kind: "off", day: "2026-10-30", time: "07:00", how: null, what: "Coffee", note: null }, null, NOW);
  repo.delete(ID);
  expect(repo.list()).toEqual([]);
  repo.restore(off);
  repo.restore(off);
  expect(repo.list()).toEqual([off]);

  expect(() =>
    repo.add({ id: "33333333-3333-4333-8333-333333333333", kind: "sick", day: "2026-10-30", time: null, how: null, what: null, note: null }, null)
  ).toThrow();
  expect(() =>
    repo.add({ id: "44444444-4444-4444-8444-444444444444", kind: "craving", day: "2026-10-30", time: null, how: null, what: " ", note: null }, null)
  ).toThrow();
});

test("an entry outlives the person who kept it, as nobody's", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying").id;
  const repo = new AppetiteRepo(db());
  repo.add({ id: ID, kind: "craving", day: "2026-10-30", time: null, how: null, what: "Ice", note: null }, sam, NOW);
  db().run("DELETE FROM person WHERE id = ?", [sam]);
  expect(repo.list()[0]?.by).toBeNull();
});
