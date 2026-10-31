import { sql } from "drizzle-orm";
import { check, index, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { Ending, Waters } from "../../../lib/itsTime";
import { person } from "../people/schema";

/** A start (src/lib/itsTime.ts): one go at it, from the waters or the first contraction to "We're there" or "we're home". One under way at a time. */
export const labourStart = sqliteTable(
  "labour_start",
  {
    id: text("id").primaryKey(),
    startedAt: text("started_at").notNull(),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    watersAt: text("waters_at"),
    waters: text("waters").$type<Waters>(),
    leftAt: text("left_at"),
    endedAt: text("ended_at"),
    ended: text("ended").$type<Ending>(),
  },
  (t) => [
    check("labour_start_waters", sql`${t.waters} IS NULL OR (${t.watersAt} IS NOT NULL AND ${t.waters} IN ('clear', 'green-brown-blood', 'unsure'))`),
    check("labour_start_ended", sql`(${t.ended} IS NULL) = (${t.endedAt} IS NULL) AND (${t.ended} IS NULL OR ${t.ended} IN ('there', 'home'))`),
    uniqueIndex("labour_start_open").on(sql`(${t.endedAt} IS NULL)`).where(sql`${t.endedAt} IS NULL`),
  ]
);

/** A contraction, timed by either phone: its start, its end once tapped, a few words. */
export const contraction = sqliteTable(
  "contraction",
  {
    id: text("id").primaryKey(),
    startId: text("start_id")
      .notNull()
      .references(() => labourStart.id, { onDelete: "cascade" }),
    startedAt: text("started_at").notNull(),
    endedAt: text("ended_at"),
    note: text("note"),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
  },
  (t) => [index("contraction_start").on(t.startId), check("contraction_note", sql`${t.note} IS NULL OR length(trim(${t.note})) > 0`)]
);

/** A last thing ticked for one start: a bag line's id, or one of the page's own keys. */
export const startTick = sqliteTable(
  "start_tick",
  {
    startId: text("start_id")
      .notNull()
      .references(() => labourStart.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    at: text("at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.startId, t.key] })]
);

/** A last thing of your own, kept between starts. */
export const startLine = sqliteTable(
  "start_line",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
  },
  (t) => [check("start_line_title", sql`length(trim(${t.title})) > 0`)]
);
