import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** Something has happened: one row while Expecting is quiet, none otherwise. `id` is always 1. */
export const quiet = sqliteTable(
  "quiet",
  {
    id: integer("id").primaryKey(),
    /** loss | news (hard news that turns everything over). */
    kind: text("kind", { enum: ["loss", "news"] }).notNull(),
    setBy: text("set_by").references(() => person.id, { onDelete: "set null" }),
    setAt: text("set_at").notNull(),
  },
  (t) => [check("quiet_single_row", sql`${t.id} = 1`), check("quiet_kind", sql`${t.kind} IN ('loss', 'news')`)]
);
