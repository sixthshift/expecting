import { sql } from "drizzle-orm";
import { check, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** One of you's bingo card: its 24 squares in order (ids from SQUARES in src/lib/bingo.ts), as JSON. */
export const bingoCard = sqliteTable(
  "bingo_card",
  {
    personId: text("person_id")
      .primaryKey()
      .references(() => person.id, { onDelete: "cascade" }),
    squares: text("squares", { mode: "json" }).$type<string[]>().notNull(),
    dealtAt: text("dealt_at").notNull(),
  },
  (t) => [check("bingo_card_squares", sql`json_valid(${t.squares}) AND json_array_length(${t.squares}) = 24`)]
);

/** A square marked on one of you's card: the day it happened, and a few words. */
export const bingoMark = sqliteTable(
  "bingo_mark",
  {
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    squareId: text("square_id").notNull(),
    day: text("day").notNull(),
    note: text("note"),
    markedAt: text("marked_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.personId, t.squareId] }), check("bingo_mark_note", sql`${t.note} IS NULL OR length(trim(${t.note})) > 0`)]
);
