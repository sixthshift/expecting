import { expect, test } from "vitest";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

test("people join in order, names trimmed", () => {
  const repo = new PeopleRepo(db());
  const jason = repo.add("  Jason ", "partner", { now: new Date("2026-10-01T00:00:00Z") });
  repo.add("Sam", "carrying", { now: new Date("2026-10-02T00:00:00Z") });
  expect(repo.list().map((p) => p.name)).toEqual(["Jason", "Sam"]);
  expect(repo.get(jason.id)).toEqual({ id: jason.id, name: "Jason", role: "partner" });
  expect(repo.get(crypto.randomUUID())).toBeNull();
});

test("a person has a name and a known role", () => {
  expect(() => db().run("INSERT INTO person (id, name, role, created_at) VALUES ('a', '  ', 'partner', 'x')")).toThrow(/CHECK/);
  expect(() => db().run("INSERT INTO person (id, name, role, created_at) VALUES ('b', 'A', 'uncle', 'x')")).toThrow(/CHECK/);
});

test("two at most, one in each role: the database refuses a third, or a second in a role", () => {
  const repo = new PeopleRepo(db());
  expect(repo.openRole()).toBeNull();
  repo.add("Sam", "carrying");
  expect(repo.openRole()).toBe("partner");
  expect(() => repo.add("Alex", "carrying")).toThrow(/two people at most/);
  repo.add("Jason", "partner");
  expect(repo.openRole()).toBeNull();
  expect(() => repo.add("Kim", "partner")).toThrow(/two people at most/);
  expect(repo.list()).toHaveLength(2);
});

test("a password is chosen when it is set, and none is kept with logins off", () => {
  const repo = new PeopleRepo(db());
  const sam = repo.add("Sam", "carrying", { passwordHash: "$argon2id$sam" });
  const jason = repo.add("Jason", "partner");
  expect(repo.password(sam.id)).toEqual({ hash: "$argon2id$sam", chosen: true });
  expect(repo.password(jason.id)).toEqual({ hash: null, chosen: false });
  repo.setPassword(jason.id, "$argon2id$jason");
  expect(repo.password(jason.id)).toEqual({ hash: "$argon2id$jason", chosen: true });
  expect(repo.password(crypto.randomUUID())).toBeNull();
});
