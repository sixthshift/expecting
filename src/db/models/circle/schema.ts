import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** One of your people (src/lib/circle.ts), with what each view sets. */
export const circlePerson = sqliteTable(
  "circle_person",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    note: text("note"),
    visit: text("visit", { enum: ["hospital", "first-weeks", "not-yet"] }),
    hears: text("hears", { enum: ["first", "next", "everyone"] }),
    help: text("help"),
    /** YYYY-MM-DD, their day on the meal train. */
    mealDay: text("meal_day"),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    check("circle_person_name", sql`length(trim(${t.name})) > 0`),
    check("circle_person_note", sql`${t.note} IS NULL OR length(trim(${t.note})) > 0`),
    check("circle_person_visit", sql`${t.visit} IS NULL OR ${t.visit} IN ('hospital', 'first-weeks', 'not-yet')`),
    check("circle_person_hears", sql`${t.hears} IS NULL OR ${t.hears} IN ('first', 'next', 'everyone')`),
    check("circle_person_help", sql`${t.help} IS NULL OR length(trim(${t.help})) > 0`),
  ]
);

/** Something one of your people gave; deleted with them. */
export const circleGift = sqliteTable(
  "circle_gift",
  {
    id: text("id").primaryKey(),
    personId: text("person_id")
      .notNull()
      .references(() => circlePerson.id, { onDelete: "cascade" }),
    what: text("what").notNull(),
    thankedAt: text("thanked_at"),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
  },
  (t) => [check("circle_gift_what", sql`length(trim(${t.what})) > 0`), index("circle_gift_person").on(t.personId)]
);

/** The words for the birth, written ahead: one row, or none. */
export const announcement = sqliteTable(
  "announcement",
  {
    id: integer("id").primaryKey(),
    body: text("body").notNull(),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [check("announcement_one", sql`${t.id} = 1`), check("announcement_body", sql`length(trim(${t.body})) > 0`)]
);
