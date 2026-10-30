import { expect, test } from "vitest";
import { JournalRepo } from "../../src/db/models/journal/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const ID = "11111111-1111-4111-8111-111111111111";

test("a note keeps who wrote it, then who changed it and when; deleted, it can be put back as it was", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying");
  const alex = people.add("Alex", "partner");
  const repo = new JournalRepo(db());
  const note = repo.add({ id: ID, day: "2026-10-30", time: "07:30", body: "  First kick!  " }, sam.id, new Date("2026-10-30T00:00:00Z"));
  expect(note).toMatchObject({ kind: "note", body: "First kick!", by: sam.id, editedBy: null });

  repo.edit({ id: ID, day: "2026-10-29", time: null, body: "First kick, the night before" }, alex.id, new Date("2026-10-31T00:00:00Z"));
  const [edited] = repo.list();
  expect(edited).toEqual({
    ...note,
    day: "2026-10-29",
    time: null,
    body: "First kick, the night before",
    editedBy: alex.id,
    editedAt: "2026-10-31T00:00:00.000Z",
  });

  repo.delete(ID);
  expect(repo.list()).toEqual([]);
  repo.restore(edited!);
  expect(repo.list()).toEqual([edited]);
});

test("the same save sent twice adds the note once", () => {
  const repo = new JournalRepo(db());
  repo.add({ id: ID, day: "2026-10-30", time: null, body: "Told Mum" }, null, new Date("2026-10-30T00:00:00Z"));
  repo.add({ id: ID, day: "2026-10-30", time: null, body: "Told Mum" }, null, new Date("2026-10-30T01:00:00Z"));
  expect(repo.list()).toHaveLength(1);
});

test("a note outlives the person who wrote it", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying");
  const repo = new JournalRepo(db());
  repo.add({ id: ID, day: "2026-10-30", time: null, body: "Told Mum" }, sam.id);
  db().run("DELETE FROM person WHERE id = ?", [sam.id]);
  expect(repo.list()[0]).toMatchObject({ body: "Told Mum", by: null });
});
