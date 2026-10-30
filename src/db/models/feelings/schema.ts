import { sql } from "drizzle-orm";
import { check, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { STEPS, type Word } from "../../../lib/feelings";
import { person } from "../people/schema";

/** How one of you is feeling, on its day. The step is shared; the words and note are only ever sent to `by`. */
export const feeling = sqliteTable(
  "feeling",
  {
    id: text("id").primaryKey(),
    by: text("by")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    /** The day, YYYY-MM-DD. */
    day: text("day").notNull(),
    /** The time, HH:MM, if given. */
    time: text("time"),
    step: text("step", { enum: STEPS }).notNull(),
    words: text("words", { mode: "json" }).$type<Word[]>().notNull().default(sql`'[]'`),
    note: text("note"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    check("feeling_step", sql`${t.step} IN ('rough', 'low', 'okay', 'good', 'great')`),
    check("feeling_words", sql`json_valid(${t.words}) AND json_type(${t.words}) = 'array'`),
    check("feeling_note", sql`${t.note} IS NULL OR length(trim(${t.note})) > 0`),
    index("feeling_day").on(t.day),
  ]
);
