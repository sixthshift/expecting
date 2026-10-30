import { sql } from "drizzle-orm";
import { check, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** One of you. Who a device is lives in a cookie, not here. */
export const person = sqliteTable(
  "person",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    /** carrying (pregnant, or will be) | partner. */
    role: text("role", { enum: ["carrying", "partner"] }).notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [check("person_name", sql`length(trim(${t.name})) > 0`), check("person_role", sql`${t.role} IN ('carrying', 'partner')`)]
);
