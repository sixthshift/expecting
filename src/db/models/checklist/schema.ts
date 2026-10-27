import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * A ticked task. `task_id` is a built-in task's id from content/ or an own
 * task's UUID; there is no foreign key because built-in tasks are not rows.
 * Unticking deletes the row.
 */
export const taskTick = sqliteTable("task_tick", {
  taskId: text("task_id").primaryKey(),
  tickedAt: text("ticked_at").notNull(),
});

/** A standalone task we added ourselves. Due at a slot on the timeline. */
export const ownTask = sqliteTable("own_task", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  /** preconception | pregnancy | postpartum */
  phase: text("phase").notNull(),
  /** Week within the phase; null for `preconception`. */
  week: integer("week"),
  createdAt: text("created_at").notNull(),
});
