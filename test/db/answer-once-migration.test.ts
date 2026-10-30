// 014_answer_once turns 'household' answers into ones naming nobody, a null
// `about`, and keeps the rest as they were. Run against a database built by
// the migrations before it, the way a real one is.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MIGRATIONS_DIR, migrate } from "../../src/db/migrations/migrate";

const sql = Object.fromEntries(
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f < "015")
    .map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), "utf8")])
);
const before = Object.fromEntries(Object.entries(sql).filter(([f]) => f < "014"));

test("an answer asked once names nobody, and one of each of you keeps whose", () => {
  const db = new Database(":memory:");
  migrate(db, { sources: before });
  db.run(
    "INSERT INTO answer (id, question, about, value, answered_at) VALUES ('a', 'cover', 'household', 'no', 'x'), ('b', 'work', 'partner', 'employee', 'y')"
  );
  migrate(db, { sources: sql });

  expect(db.query("SELECT id, question, about, value, answered_at FROM answer ORDER BY id").all()).toEqual([
    { id: "a", question: "cover", about: null, value: "no", answered_at: "x" },
    { id: "b", question: "work", about: "partner", value: "employee", answered_at: "y" },
  ]);
  expect(() => db.run("INSERT INTO answer (id, question, about, answered_at) VALUES ('c', 'cover', 'household', 'x')")).toThrow(/CHECK/);
  expect(db.query("SELECT name FROM sqlite_master WHERE name = 'answer_latest'").get()).not.toBeNull();
});
