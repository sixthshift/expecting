import { sql } from "drizzle-orm";
import { check, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** A list of your own, beside the built-in ones (LISTS in src/lib/lists.ts). */
export const ownList = sqliteTable(
  "own_list",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
  },
  (t) => [check("own_list_title", sql`length(trim(${t.title})) > 0`)]
);

/**
 * A line of your own, on a built-in list (by its id) or one of your own (by
 * its UUID): no foreign key, as the built-in lists are not rows.
 */
export const ownLine = sqliteTable(
  "own_line",
  {
    id: text("id").primaryKey(),
    listId: text("list_id").notNull(),
    title: text("title").notNull(),
    /** One of its built-in list's sections; null for none. */
    section: text("section"),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
  },
  (t) => [check("own_line_title", sql`length(trim(${t.title})) > 0`), index("own_line_list").on(t.listId)]
);

/**
 * A line's mark: arranged, got or not needed, with how it was got and a few
 * words, and who set it last. `line_id` is a built-in line's id from content/
 * or an own line's UUID; there is no foreign key, as with task_tick. No row,
 * or no state (a line with only words), is still to get.
 */
export const listMark = sqliteTable(
  "list_mark",
  {
    lineId: text("line_id").primaryKey(),
    state: text("state", { enum: ["arranged", "got", "not-needed"] }),
    /** Only once got. */
    how: text("how", { enum: ["bought", "borrowed", "hired", "second-hand", "given"] }),
    note: text("note"),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    check("list_mark_state", sql`${t.state} IS NULL OR ${t.state} IN ('arranged', 'got', 'not-needed')`),
    check("list_mark_how", sql`${t.how} IS NULL OR (${t.state} = 'got' AND ${t.how} IN ('bought', 'borrowed', 'hired', 'second-hand', 'given'))`),
    check("list_mark_note", sql`${t.note} IS NULL OR length(trim(${t.note})) > 0`),
    check("list_mark_something", sql`${t.state} IS NOT NULL OR ${t.note} IS NOT NULL`),
  ]
);
