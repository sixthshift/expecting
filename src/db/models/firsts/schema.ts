import { sql } from "drizzle-orm";
import { check, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** A first (src/lib/firsts.ts), marked on its day, or put aside: a suggestion said no to, `day` null. */
export const firstMark = sqliteTable("first_mark", {
  key: text("key").primaryKey(),
  /** The day it happened, YYYY-MM-DD; null when put aside. */
  day: text("day"),
  by: text("by").references(() => person.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull(),
});

/** One of you's own words for a first: the answer to its question. */
export const firstWords = sqliteTable(
  "first_words",
  {
    key: text("key")
      .notNull()
      .references(() => firstMark.key, { onDelete: "cascade" }),
    by: text("by")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    editedAt: text("edited_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.key, t.by] }), check("first_words_body", sql`length(trim(${t.body})) > 0`)]
);
