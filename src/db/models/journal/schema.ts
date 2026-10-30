import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** Something kept in the Journal, on its day. Its week is worked out on read, from the due date. */
export const journalEntry = sqliteTable(
  "journal_entry",
  {
    id: text("id").primaryKey(),
    /** note, movement, or letter (a note to the baby). */
    kind: text("kind", { enum: ["note", "movement", "letter"] }).notNull(),
    /** The day it happened, YYYY-MM-DD. */
    day: text("day").notNull(),
    /** The time it happened, HH:MM, if given. */
    time: text("time"),
    /** A note's words; a movement's are optional, and empty without. */
    body: text("body").notNull(),
    /** A movement felt as slower, weaker or stopped. Always false for a note. */
    different: integer("different", { mode: "boolean" }).notNull().default(false),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
    editedBy: text("edited_by").references(() => person.id, { onDelete: "set null" }),
    editedAt: text("edited_at"),
  },
  (t) => [
    check("journal_entry_kind", sql`${t.kind} IN ('note', 'movement', 'letter')`),
    check("journal_entry_body", sql`${t.kind} = 'movement' OR length(trim(${t.body})) > 0`),
    check("journal_entry_different", sql`${t.kind} = 'movement' OR ${t.different} = 0`),
    index("journal_entry_day").on(t.day),
  ]
);

/** When each of you last opened the Journal, for "since you looked". */
export const journalSeen = sqliteTable("journal_seen", {
  personId: text("person_id")
    .primaryKey()
    .references(() => person.id, { onDelete: "cascade" }),
  seenAt: text("seen_at").notNull(),
});
