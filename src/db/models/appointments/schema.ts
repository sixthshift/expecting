import { sql } from "drizzle-orm";
import { check, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** An appointment: what it is, its day and perhaps its time and place, and notes. One-off: nothing repeats. Its week is worked out on read, from the due date. */
export const appointment = sqliteTable(
  "appointment",
  {
    id: text("id").primaryKey(),
    /** What it is, in a few words: "Midwife", "20-week scan". */
    title: text("title").notNull(),
    /** Its day, YYYY-MM-DD, local. */
    day: text("day").notNull(),
    /** Its time, HH:MM, local, if known. */
    time: text("time"),
    /** Where, in your words, if given. */
    place: text("place"),
    /** Anything to remember, before or after. */
    notes: text("notes"),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
    editedBy: text("edited_by").references(() => person.id, { onDelete: "set null" }),
    editedAt: text("edited_at"),
  },
  (t) => [check("appointment_title", sql`length(trim(${t.title})) > 0`), index("appointment_day").on(t.day)]
);
