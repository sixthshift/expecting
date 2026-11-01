import { sql } from "drizzle-orm";
import { check, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** One of you's answer to a week's question (WEEKLY in src/lib/weekly.ts). */
export const weeklyAnswer = sqliteTable(
  "weekly_answer",
  {
    week: integer("week").notNull(),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    answeredAt: text("answered_at").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.week, t.personId] }),
    check("weekly_answer_week", sql`${t.week} BETWEEN 1 AND 42`),
    check("weekly_answer_body", sql`length(trim(${t.body})) > 0`),
  ]
);
