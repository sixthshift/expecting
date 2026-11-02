import { sql } from "drizzle-orm";
import { check, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/**
 * A logged-in browser, as one of you. Only the SHA-256 of the cookie's token
 * is stored, so a copy of the database is not a copy of anyone's login.
 */
export const session = sqliteTable(
  "session",
  {
    tokenHash: text("token_hash").primaryKey(),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
    lastSeenAt: text("last_seen_at").notNull(),
  },
  (t) => [index("session_person").on(t.personId)]
);

/**
 * A link one of you made: to join, as the other, or (a reset) for `personId`
 * to choose a new password. Used once; only its code's SHA-256 is stored.
 */
export const invite = sqliteTable(
  "invite",
  {
    codeHash: text("code_hash").primaryKey(),
    kind: text("kind", { enum: ["join", "reset"] }).notNull(),
    personId: text("person_id").references(() => person.id, { onDelete: "cascade" }),
    by: text("by")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
    expiresAt: text("expires_at").notNull(),
  },
  (t) => [check("invite_kind", sql`${t.kind} IN ('join', 'reset')`), check("invite_whose", sql`(${t.kind} = 'reset') = (${t.personId} IS NOT NULL)`)]
);
