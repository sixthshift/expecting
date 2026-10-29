import { sql } from "drizzle-orm";
import { check, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** One field of the Emergency info page (src/lib/emergency.ts), once one of you has filled it in. A blank field has no row. */
export const emergencyField = sqliteTable(
  "emergency",
  {
    field: text("field").primaryKey(),
    value: text("value").notNull(),
    changedBy: text("changed_by").references(() => person.id, { onDelete: "set null" }),
    changedAt: text("changed_at").notNull(),
  },
  (t) => [check("emergency_value", sql`length(trim(${t.value})) > 0`)]
);
