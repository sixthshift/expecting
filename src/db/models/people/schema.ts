import { sql } from "drizzle-orm";
import { check, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * One of you: an account. Two at most, one in each role (a trigger,
 * `person_two_at_most`, in 036_accounts.sql). Logging in as one is a session
 * (`src/db/models/auth/`).
 */
export const person = sqliteTable(
  "person",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    /** carrying (pregnant, or will be) | partner. */
    role: text("role", { enum: ["carrying", "partner"] }).notNull(),
    createdAt: text("created_at").notNull(),
    /** argon2id; null until one is chosen (never, with logins off). */
    passwordHash: text("password_hash"),
  },
  (t) => [check("person_name", sql`length(trim(${t.name})) > 0`), check("person_role", sql`${t.role} IN ('carrying', 'partner')`)]
);
