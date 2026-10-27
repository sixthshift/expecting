import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * A logged-in browser. Only the SHA-256 of the cookie's token is stored, so a
 * copy of the database is not a copy of anyone's login.
 */
export const session = sqliteTable("session", {
  tokenHash: text("token_hash").primaryKey(),
  createdAt: text("created_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
});
