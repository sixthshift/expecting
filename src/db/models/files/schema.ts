import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { FILE_TYPES } from "../../../lib/files";
import { person } from "../people/schema";

/**
 * A file kept for a record (a photo now; results and papers next). Its bytes
 * are on disk, in DATA_DIR/uploads/<id>/ (src/server/files/store.ts); this
 * says what they are. A record points at it with `REFERENCES upload(id)`.
 */
export const upload = sqliteTable(
  "upload",
  {
    /** The phone's id for it, so sending it twice keeps one. */
    id: text("id").primaryKey(),
    /** Its name as given ("IMG_2041.jpg"), for downloading it. */
    name: text("name").notNull(),
    /** Sniffed from its first bytes, never the browser's say-so. */
    type: text("type", { enum: FILE_TYPES }).notNull(),
    /** The original's size, in bytes. */
    size: integer("size").notNull(),
    /** A picture's size, upright, in pixels; null for a PDF. */
    width: integer("width"),
    height: integer("height"),
    /** Whether it has a display copy and a thumbnail (a picture does). */
    display: integer("display", { mode: "boolean" }).notNull().default(false),
    thumb: integer("thumb", { mode: "boolean" }).notNull().default(false),
    by: text("by").references(() => person.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    check("upload_type", sql`${t.type} IN ('image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf')`),
    check("upload_size", sql`${t.size} > 0`),
  ]
);
