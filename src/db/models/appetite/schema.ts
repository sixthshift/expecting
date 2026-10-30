import { sql } from "drizzle-orm";
import { check, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { APPETITE_KINDS, HOWS } from "../../../lib/appetite";
import { person } from "../people/schema";

/** Being sick, a craving, or something gone off, on its day. Shared: either of you can change any. Its week is worked out on read. */
export const appetiteEntry = sqliteTable(
  "appetite_entry",
  {
    id: text("id").primaryKey(),
    /** sick, craving or off (gone off it). */
    kind: text("kind", { enum: APPETITE_KINDS }).notNull(),
    /** The day, YYYY-MM-DD. */
    day: text("day").notNull(),
    /** The time, HH:MM, if given. */
    time: text("time"),
    /** How bad, for sickness only: queasy, vomited, or fluids (can't keep fluids down). */
    how: text("how", { enum: HOWS }),
    /** What was craved or gone off; null for sickness. */
    what: text("what"),
    /** A few words, if any. */
    note: text("note"),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
    editedBy: text("edited_by").references(() => person.id, { onDelete: "set null" }),
    editedAt: text("edited_at"),
  },
  (t) => [
    check("appetite_entry_kind", sql`${t.kind} IN ('sick', 'craving', 'off')`),
    check(
      "appetite_entry_how",
      sql`(${t.kind} = 'sick' AND ${t.how} IS NOT NULL AND ${t.how} IN ('queasy', 'vomited', 'fluids')) OR (${t.kind} <> 'sick' AND ${t.how} IS NULL)`
    ),
    check(
      "appetite_entry_what",
      sql`(${t.kind} = 'sick' AND ${t.what} IS NULL) OR (${t.kind} <> 'sick' AND ${t.what} IS NOT NULL AND length(trim(${t.what})) > 0)`
    ),
    check("appetite_entry_note", sql`${t.note} IS NULL OR length(trim(${t.note})) > 0`),
    index("appetite_entry_day").on(t.day),
  ]
);
