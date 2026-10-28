// 007_pregnancy_only folds getting ready and the weeks after the birth into
// the pregnancy: own tasks become pregnancy weeks, and the birth date and the
// "expecting yet?" answer go. Run against a database built by the migrations
// before it, the way a household's real one is.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MIGRATIONS_DIR, migrate } from "../../src/db/migrations/migrate";

const sql = Object.fromEntries(
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f < "008")
    .map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), "utf8")])
);
const before = Object.fromEntries(Object.entries(sql).filter(([f]) => f < "007"));

function oldDatabase(): Database {
  const db = new Database(":memory:");
  migrate(db, { sources: before });
  db.run("INSERT INTO household (id, due_date, birth_date, updated_at, profile) VALUES (1, '2027-03-01', '2027-02-20', 'x', ?)", [
    JSON.stringify({ expecting: "yes", cover: "no" }),
  ]);
  db.run(
    `INSERT INTO own_task (id, title, phase, week, created_at) VALUES
      ('a', 'Get cover', 'preconception', NULL, 'x'),
      ('b', 'Pack', 'pregnancy', 36, 'x'),
      ('c', 'Register', 'postpartum', 3, 'x')`
  );
  return db;
}

test("own tasks land on a pregnancy week: getting ready's at 1, the newborn's at 42", () => {
  const db = oldDatabase();
  migrate(db, { sources: sql });
  expect(db.query("SELECT * FROM own_task ORDER BY id").all()).toEqual([
    { id: "a", title: "Get cover", week: 1, created_at: "x" },
    { id: "b", title: "Pack", week: 36, created_at: "x" },
    { id: "c", title: "Register", week: 42, created_at: "x" },
  ]);
});

test("the birth date and the expecting answer go; the due date and other answers stay", () => {
  const db = oldDatabase();
  migrate(db, { sources: sql });
  const row = db.query<Record<string, unknown>, []>("SELECT * FROM household").get()!;
  expect(row).not.toHaveProperty("birth_date");
  expect(row.due_date).toBe("2027-03-01");
  expect(JSON.parse(row.profile as string)).toEqual({ cover: "no" });
});

test("an own task's week is 1 to 42", () => {
  const db = oldDatabase();
  migrate(db, { sources: sql });
  expect(() => db.run("INSERT INTO own_task (id, title, week, created_at) VALUES ('d', 'D', 43, 'x')")).toThrow(/CHECK/);
});
