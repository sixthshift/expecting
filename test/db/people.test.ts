import { expect, test } from "vitest";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

test("people join in order, names trimmed", () => {
  const repo = new PeopleRepo(db());
  const jason = repo.add("  Jason ", "partner", new Date("2026-10-01T00:00:00Z"));
  repo.add("Sam", "carrying", new Date("2026-10-02T00:00:00Z"));
  expect(repo.list().map((p) => p.name)).toEqual(["Jason", "Sam"]);
  expect(repo.get(jason.id)).toEqual({ id: jason.id, name: "Jason", role: "partner" });
  expect(repo.get(crypto.randomUUID())).toBeNull();
});

test("a person has a name and a known role", () => {
  expect(() => db().run("INSERT INTO person (id, name, role, created_at) VALUES ('a', '  ', 'partner', 'x')")).toThrow(/CHECK/);
  expect(() => db().run("INSERT INTO person (id, name, role, created_at) VALUES ('b', 'A', 'uncle', 'x')")).toThrow(/CHECK/);
});
