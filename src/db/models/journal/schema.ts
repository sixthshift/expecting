import { sql } from "drizzle-orm";
import { check, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** Something kept in the Journal, on its day. Its week is worked out on read, from the due date. */
export const journalEntry = sqliteTable(
  "journal_entry",
  {
    id: text("id").primaryKey(),
    /** note (the other kinds come later). */
    kind: text("kind", { enum: ["note"] }).notNull(),
    /** The day it happened, YYYY-MM-DD. */
    day: text("day").notNull(),
    /** The time it happened, HH:MM, if given. */
    time: text("time"),
    body: text("body").notNull(),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
    editedBy: text("edited_by").references(() => person.id, { onDelete: "set null" }),
    editedAt: text("edited_at"),
  },
  (t) => [
    check("journal_entry_kind", sql`${t.kind} IN ('note')`),
    check("journal_entry_body", sql`length(trim(${t.body})) > 0`),
    index("journal_entry_day").on(t.day),
  ]
);
