import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** Each extra in src/features/settings/model/extras.data.ts someone has turned on or off. No row is undecided. */
export const extra = sqliteTable(
  "extra",
  {
    id: text("id").primaryKey(),
    on: integer("on", { mode: "boolean" }).notNull(),
    changedBy: text("changed_by").references(() => person.id, { onDelete: "set null" }),
    changedAt: text("changed_at").notNull(),
  },
  (t) => [check("extra_id", sql`length(${t.id}) > 0`)]
);
