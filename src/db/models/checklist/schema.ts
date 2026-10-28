import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * A ticked task. `task_id` is a built-in task's id from content/ or an own
 * task's UUID; there is no foreign key because built-in tasks are not rows.
 * Unticking deletes the row.
 */
export const taskTick = sqliteTable("task_tick", {
  taskId: text("task_id").primaryKey(),
  tickedAt: text("ticked_at").notNull(),
});

/** A standalone task we added ourselves. Due in a week of the pregnancy. */
export const ownTask = sqliteTable(
  "own_task",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    /** Pregnancy week, 1–42. */
    week: integer("week").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [check("own_task_week", sql`${t.week} BETWEEN 1 AND 42`)]
);
