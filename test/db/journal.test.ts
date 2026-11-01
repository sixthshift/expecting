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

test("a movement needs no words, can be marked as different, and is changed only as a movement", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying");
  const repo = new JournalRepo(db());
  const moved = repo.addMovement({ id: ID, day: "2026-10-30", time: "21:15", body: "  ", different: false }, sam.id, new Date("2026-10-30T10:00:00Z"));
  expect(moved).toMatchObject({ kind: "movement", body: "", different: false, by: sam.id });

  repo.editMovement({ id: ID, day: "2026-10-30", time: "21:10", body: "Quieter than usual", different: true }, sam.id, new Date("2026-10-30T11:00:00Z"));
  expect(repo.list()[0]).toMatchObject({ kind: "movement", time: "21:10", body: "Quieter than usual", different: true, editedAt: "2026-10-30T11:00:00.000Z" });

  // A note's change doesn't reach a movement, nor a movement's a note.
  repo.edit({ id: ID, day: "2026-10-01", time: null, body: "Not a note" }, sam.id);
  expect(repo.list()[0]).toMatchObject({ day: "2026-10-30", body: "Quieter than usual" });
  const NOTE = "22222222-2222-4222-8222-222222222222";
  repo.add({ id: NOTE, day: "2026-10-30", time: null, body: "Told Mum" }, sam.id);
  repo.editMovement({ id: NOTE, day: "2026-10-30", time: "09:00", body: "", different: true }, sam.id);
  expect(repo.list().find((e) => e.id === NOTE)).toMatchObject({ kind: "note", body: "Told Mum", different: false });
});

test("a note still needs words, and is never marked as different", () => {
  expect(() =>
    db().run("INSERT INTO journal_entry (id, kind, day, body, created_at) VALUES ('a', 'note', '2026-10-30', '  ', '2026-10-30T00:00:00Z')")
  ).toThrow(/CHECK/);
  expect(() =>
    db().run("INSERT INTO journal_entry (id, kind, day, body, different, created_at) VALUES ('a', 'note', '2026-10-30', 'Hi', 1, '2026-10-30T00:00:00Z')")
  ).toThrow(/CHECK/);
});

test("a letter to the baby is a note's kind: kept, changed back to a note, and needing its words", () => {
  const repo = new JournalRepo(db());
  repo.add({ id: ID, day: "2026-10-30", time: null, body: "Dear you", kind: "letter" }, null);
  expect(repo.list()[0]).toMatchObject({ kind: "letter", body: "Dear you" });
  repo.edit({ id: ID, day: "2026-10-30", time: null, body: "Dear you, again" }, null);
  expect(repo.list()[0]).toMatchObject({ kind: "letter", body: "Dear you, again" });
  repo.edit({ id: ID, day: "2026-10-30", time: null, body: "Just a note", kind: "note" }, null);
  expect(repo.list()[0]).toMatchObject({ kind: "note" });
  expect(() => db().run("INSERT INTO journal_entry (id, kind, day, time, body, created_at) VALUES ('b', 'letter', '2026-10-30', NULL, '  ', 'x')")).toThrow();
});

test("a letter can be from both of you; a note never is, and a phone that doesn't say leaves it as it was", () => {
  const repo = new JournalRepo(db());
  repo.add({ id: ID, day: "2026-10-30", time: null, body: "Dear you", kind: "letter", fromBoth: true }, null);
  expect(repo.list()[0]).toMatchObject({ kind: "letter", fromBoth: true });
  repo.edit({ id: ID, day: "2026-10-30", time: null, body: "Dear you, again" }, null);
  expect(repo.list()[0]).toMatchObject({ fromBoth: true });
  repo.edit({ id: ID, day: "2026-10-30", time: null, body: "Dear you", kind: "letter", fromBoth: false }, null);
  expect(repo.list()[0]).toMatchObject({ fromBoth: false });
  repo.edit({ id: ID, day: "2026-10-30", time: null, body: "Dear you", kind: "letter", fromBoth: true }, null);
  repo.edit({ id: ID, day: "2026-10-30", time: null, body: "Just a note", kind: "note" }, null);
  expect(repo.list()[0]).toMatchObject({ kind: "note", fromBoth: false });
  const NOTE = "22222222-2222-4222-8222-222222222222";
  repo.add({ id: NOTE, day: "2026-10-30", time: null, body: "Hi", kind: "note", fromBoth: true }, null);
  expect(repo.list().find((e) => e.id === NOTE)).toMatchObject({ fromBoth: false });
  expect(() =>
    db().run("INSERT INTO journal_entry (id, kind, day, body, from_both, created_at) VALUES ('c', 'note', '2026-10-30', 'Hi', 1, '2026-10-30T00:00:00Z')")
  ).toThrow(/CHECK/);
});

test("when each of you last opened the Journal, never going back", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying");
  const repo = new JournalRepo(db());
  expect(repo.seen(sam.id)).toBeNull();
  repo.markSeen(sam.id, "2026-10-30T10:00:00.000Z");
  repo.markSeen(sam.id, "2026-10-29T10:00:00.000Z");
  expect(repo.seen(sam.id)).toBe("2026-10-30T10:00:00.000Z");
  repo.markSeen(sam.id, "2026-10-31T10:00:00.000Z");
  expect(repo.seen(sam.id)).toBe("2026-10-31T10:00:00.000Z");
});
