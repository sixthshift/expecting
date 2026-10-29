// 012_settings rebuilds the household table as settings, keeping its row. Run
// against a database built by the migrations before it, the way a household's
// real one is.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MIGRATIONS_DIR, migrate } from "../../src/db/migrations/migrate";

const sql = Object.fromEntries(
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f < "013")
    .map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), "utf8")])
);
const before = Object.fromEntries(Object.entries(sql).filter(([f]) => f < "012"));

test("the household's row becomes the settings row, and the household table goes", () => {
  const db = new Database(":memory:");
  migrate(db, { sources: before });
  db.run("INSERT INTO household (id, due_date, baby, onboarded_at, updated_at) VALUES (1, '2027-04-01', 'girl', '2026-10-01', '2026-10-02')");
  migrate(db, { sources: sql });

  expect(db.query("SELECT * FROM settings").all()).toEqual([
    { id: 1, due_date: "2027-04-01", baby: "girl", onboarded_at: "2026-10-01", updated_at: "2026-10-02" },
  ]);
  expect(db.query("SELECT name FROM sqlite_master WHERE name = 'household'").get()).toBeNull();
  expect(() => db.run("INSERT INTO settings (id, updated_at) VALUES (2, 'x')")).toThrow(/CHECK/);
});
