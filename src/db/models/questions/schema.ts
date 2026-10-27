import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/** A question for the next appointment. Asked questions keep their answers. */
export const question = sqliteTable("question", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  answer: text("answer"),
  askedAt: text("asked_at"),
  createdAt: text("created_at").notNull(),
});
