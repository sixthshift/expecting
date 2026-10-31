import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** A question for the next appointment. Asked questions keep their answers. */
export const question = sqliteTable("question", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  answer: text("answer"),
  askedAt: text("asked_at"),
  /** The Library entry it was asked from; an item id, not a foreign key (items are files). */
  itemId: text("item_id"),
  by: text("by").references(() => person.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull(),
});
