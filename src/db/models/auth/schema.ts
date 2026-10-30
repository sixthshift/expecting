import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * A logged-in browser. Only the SHA-256 of the cookie's token is stored, so a
 * copy of the database is not a copy of anyone's login.
 */
export const session = sqliteTable("session", {
  tokenHash: text("token_hash").primaryKey(),
  createdAt: text("created_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
});

/**
 * The household password, as its argon2id hash. One row, `id` always 1,
 * written once: by whoever visits first (`choosePassword`).
 */
export const password = sqliteTable(
  "password",
  {
    id: integer("id").primaryKey(),
    hash: text("hash").notNull(),
    setAt: text("set_at").notNull(),
  },
  (t) => [check("password_single_row", sql`${t.id} = 1`)]
);
