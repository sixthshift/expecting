import { sql } from "drizzle-orm";
import { check, index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { PAPER_KINDS } from "../../../lib/papers";
import { upload } from "../files/schema";
import { person } from "../people/schema";

/**
 * A result, a letter, a plan, a record, or something else, on the date it
 * bears. Shared: either of you can change any. Never what it says. Its week is
 * worked out on read.
 */
export const paper = sqliteTable(
  "paper",
  {
    id: text("id").primaryKey(),
    /** result, letter, plan, record or other. */
    kind: text("kind", { enum: PAPER_KINDS }).notNull(),
    title: text("title").notNull(),
    /** The Library entry it's about (src/lib/papers.ts, PAPER_TOPICS), if any. */
    itemId: text("item_id"),
    /** The date on it, YYYY-MM-DD. */
    day: text("day").notNull(),
    /** A few words, if any. */
    note: text("note"),
    /** On top, on Emergency info, and kept on each phone for offline. */
    handy: integer("handy", { mode: "boolean" }).notNull().default(false),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
    editedBy: text("edited_by").references(() => person.id, { onDelete: "set null" }),
    editedAt: text("edited_at"),
  },
  (t) => [
    check("paper_kind", sql`${t.kind} IN ('result', 'letter', 'plan', 'record', 'other')`),
    check("paper_title", sql`length(trim(${t.title})) > 0`),
    check("paper_note", sql`${t.note} IS NULL OR length(trim(${t.note})) > 0`),
    index("paper_day").on(t.day),
  ]
);

/** A paper's pages, in order: each an upload. Deleting the paper deletes them; the server drops their uploads. */
export const paperPage = sqliteTable(
  "paper_page",
  {
    paperId: text("paper_id")
      .notNull()
      .references(() => paper.id, { onDelete: "cascade" }),
    /** From 0, as kept. */
    position: integer("position").notNull(),
    /** The upload it shows; one page each. */
    fileId: text("file_id")
      .notNull()
      .references(() => upload.id),
  },
  (t) => [primaryKey({ columns: [t.paperId, t.position] }), check("paper_page_position", sql`${t.position} >= 0`), uniqueIndex("paper_page_file").on(t.fileId)]
);
