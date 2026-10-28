import { sql } from "drizzle-orm";
import { check, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/**
 * Every answer to content/facts.yaml's questions, kept: the latest for a
 * question and its subject is the fact. No value is skipped, or cleared.
 */
export const answer = sqliteTable(
  "answer",
  {
    id: text("id").primaryKey(),
    question: text("question").notNull(),
    /** household | carrying | partner: whose fact it is. */
    about: text("about", { enum: ["household", "carrying", "partner"] }).notNull(),
    /** An answer's id, or a date as YYYY-MM-DD; null when skipped or cleared. */
    value: text("value"),
    answeredBy: text("answered_by").references(() => person.id, { onDelete: "set null" }),
    answeredAt: text("answered_at").notNull(),
  },
  (t) => [
    index("answer_latest").on(t.question, t.about, t.answeredAt),
    check("answer_question", sql`length(${t.question}) > 0`),
    check("answer_about", sql`${t.about} IN ('household', 'carrying', 'partner')`),
  ]
);
