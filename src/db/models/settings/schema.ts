import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** The one row of settings. `id` is always 1. */
export const settings = sqliteTable(
  "settings",
  {
    id: integer("id").primaryKey(),
    dueDate: text("due_date"),
    /** boy | girl | unknown (don't know, or keeping it a surprise). Chooses the theme. */
    baby: text("baby", { enum: ["boy", "girl", "unknown"] })
      .notNull()
      .default("unknown"),
    /** When onboarding was finished; null until then. */
    onboardedAt: text("onboarded_at"),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [check("settings_single_row", sql`${t.id} = 1`), check("settings_baby", sql`${t.baby} IN ('boy', 'girl', 'unknown')`)]
);
