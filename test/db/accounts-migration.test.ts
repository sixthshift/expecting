// 036_accounts makes each of you an account. Run against a database built by
// the migrations before it: the shared password is carried to everyone
// already here, still to be replaced by their own; sessions, no one's, go;
// and a database that already holds more than the two allowed still opens.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MIGRATIONS_DIR, migrate } from "../../src/db/migrations/migrate";
import { PeopleRepo } from "../../src/db/models/people/repo";

const sql = Object.fromEntries(
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f < "037")
    .map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), "utf8")])
);
const before = Object.fromEntries(Object.entries(sql).filter(([f]) => f < "036"));

function seeded(people: [string, string, string][], password: boolean) {
  const db = new Database(":memory:");
  migrate(db, { sources: before });
  for (const [id, name, role] of people) db.run("INSERT INTO person (id, name, role, created_at) VALUES (?, ?, ?, ?)", [id, name, role, `2026-10-0${id}`]);
  if (password) db.run("INSERT INTO password (id, hash, set_at) VALUES (1, '$argon2id$shared', 'x')");
  db.run("INSERT INTO session (token_hash, created_at, last_seen_at) VALUES ('abc', 'x', 'x')");
  migrate(db, { sources: sql });
  return db;
}

test("the shared password is carried to each of you, to log in with once and then replace", () => {
  const db = seeded(
    [
      ["1", "Sam", "carrying"],
      ["2", "Jason", "partner"],
    ],
    true
  );
  const people = new PeopleRepo(db);
  expect(people.password("1")).toEqual({ hash: "$argon2id$shared", chosen: false });
  expect(people.password("2")).toEqual({ hash: "$argon2id$shared", chosen: false });
  expect(db.query("SELECT count(*) AS n FROM session").get()).toEqual({ n: 0 });
  expect(db.query("SELECT name FROM sqlite_master WHERE name = 'password'").get()).toBeNull();
});

test("with no password before (logins were off), there's none to carry: each chooses theirs on logging in", () => {
  const db = seeded([["1", "Sam", "carrying"]], false);
  expect(new PeopleRepo(db).password("1")).toEqual({ hash: null, chosen: false });
});

test("a database holding two in one role still opens, and nobody more can join", () => {
  const db = seeded(
    [
      ["1", "Jason", "carrying"],
      ["2", "Cindy", "carrying"],
    ],
    true
  );
  const people = new PeopleRepo(db);
  expect(people.list().map((p) => p.name)).toEqual(["Jason", "Cindy"]);
  expect(people.openRole()).toBeNull();
  expect(() => people.add("Kim", "partner")).toThrow(/two people at most/);
});
