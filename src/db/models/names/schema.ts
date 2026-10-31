import { sql } from "drizzle-orm";
import { check, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** A name in the game: one either of you added, or one from the deck once someone has voted on it. Each name once, whatever its case. */
export const babyName = sqliteTable(
  "baby_name",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    addedBy: text("added_by").references(() => person.id, { onDelete: "set null" }),
    addedAt: text("added_at").notNull(),
    fromDeck: integer("from_deck", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [
    uniqueIndex("baby_name_once").on(sql`lower(${t.name})`),
    check("baby_name_name", sql`length(trim(${t.name})) > 0`),
    check("baby_name_from_deck", sql`${t.fromDeck} IN (0, 1)`),
  ]
);

/** One person's vote on one name: liked, or passed. Only ever shown to its owner. */
export const nameVote = sqliteTable(
  "name_vote",
  {
    nameId: text("name_id")
      .notNull()
      .references(() => babyName.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    liked: integer("liked", { mode: "boolean" }).notNull(),
    votedAt: text("voted_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.nameId, t.personId] }), check("name_vote_liked", sql`${t.liked} IN (0, 1)`)]
);
