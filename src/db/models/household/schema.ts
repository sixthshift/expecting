import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** The household's one row of settings. `id` is always 1. */
export const household = sqliteTable(
  "household",
  {
    id: integer("id").primaryKey(),
    dueDate: text("due_date"),
    birthDate: text("birth_date"),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [check("household_single_row", sql`${t.id} = 1`)]
);
